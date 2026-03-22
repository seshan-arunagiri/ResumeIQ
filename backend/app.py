"""
app.py
------
Flask backend for ResumeIQ — College Placement Screening Tool

Endpoints:
  GET  /health                  → liveness probe
  POST /company                 → create a company profile
  GET  /company                 → list all companies
  GET  /company/<id>            → get a single company
  PUT  /company/<id>            → update a company
  DELETE /company/<id>          → delete a company
  POST /upload                  → upload one PDF and process it
  POST /upload/bulk             → upload multiple PDFs at once (returns list)
  GET  /students/<company_id>   → ranked student list for a company
  DELETE /students/<id>         → delete a single student record
"""

import json
import os

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from database     import init_db, get_db
from extractor    import extract_resume
from leetcode     import get_leetcode_stats
from github_fetch import get_github_stats
from scorer       import calculate_score
from jd_analyzer  import analyze_job_description

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


# ─────────────────────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "ResumeIQ"})


# ─────────────────────────────────────────────────────────────────────────────
# Company endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/company", methods=["POST"])
def create_company():
    d = request.get_json(silent=True) or {}
    if not d.get("name"):
        return jsonify({"error": "company name is required"}), 400

    weights = d.get("weights", {})
    conn = get_db()
    cur = conn.execute(
        """INSERT INTO companies
           (name, min_cgpa, required_skills,
            weight_cgpa, weight_leetcode, weight_github, weight_skills)
           VALUES (?,?,?,?,?,?,?)""",
        (
            d["name"],
            float(d.get("min_cgpa", 0)),
            d.get("required_skills", ""),
            int(weights.get("cgpa",     d.get("weight_cgpa",     20))),
            int(weights.get("leetcode", d.get("weight_leetcode", 30))),
            int(weights.get("github",   d.get("weight_github",   20))),
            int(weights.get("skills",   d.get("weight_skills",   30))),
        ),
    )
    conn.commit()
    company_id = cur.lastrowid
    conn.close()
    return jsonify({"id": company_id, "message": "Company created"}), 201


@app.route("/company", methods=["GET"])
def get_companies():
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM companies ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/company/<int:company_id>", methods=["GET"])
def get_company(company_id):
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM companies WHERE id = ?", (company_id,)
    ).fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "company not found"}), 404
    return jsonify(dict(row))


@app.route("/company/<int:company_id>", methods=["PUT"])
def update_company(company_id):
    d = request.get_json(silent=True) or {}
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM companies WHERE id = ?", (company_id,)
    ).fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "company not found"}), 404

    c = dict(row)
    conn.execute(
        """UPDATE companies SET
           name=?, min_cgpa=?, required_skills=?,
           weight_cgpa=?, weight_leetcode=?, weight_github=?, weight_skills=?
           WHERE id=?""",
        (
            d.get("name",            c["name"]),
            float(d.get("min_cgpa", c["min_cgpa"])),
            d.get("required_skills", c["required_skills"]),
            int(d.get("weight_cgpa",     c["weight_cgpa"])),
            int(d.get("weight_leetcode", c["weight_leetcode"])),
            int(d.get("weight_github",   c["weight_github"])),
            int(d.get("weight_skills",   c["weight_skills"])),
            company_id,
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Company updated"})


@app.route("/analyze-jd", methods=["POST"])
def analyze_jd():
    d = request.get_json(silent=True) or {}
    text = d.get("jd_text")
    if not text:
        return jsonify({"error": "jd_text is required"}), 400
    try:
        result = analyze_job_description(text)
        return jsonify(result)
    except Exception as e:
        print(f"[JD ANALYZE ERROR] {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/company/<int:company_id>", methods=["DELETE"])
def delete_company(company_id):
    conn = get_db()
    conn.execute("DELETE FROM students WHERE company_id = ?", (company_id,))
    conn.execute("DELETE FROM companies WHERE id = ?", (company_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Company and its students deleted"})


# ─────────────────────────────────────────────────────────────────────────────
# Upload helpers
# ─────────────────────────────────────────────────────────────────────────────

def _resolve_company(company_id, conn):
    """Fetch company row as dict or return None."""
    row = conn.execute(
        "SELECT * FROM companies WHERE id = ?", (company_id,)
    ).fetchone()
    return dict(row) if row else None


def _process_pdf(pdf_bytes: bytes, filename: str, company: dict) -> dict:
    """
    Full pipeline for one PDF:
      1. AI extraction (Groq, with cache)
      2. LeetCode fetch
      3. GitHub fetch
      4. Score calculation
      5. Upsert into DB
      6. Return full result dict
    """
    company_id = company["id"]

    # ── 1. AI extraction ────────────────────────────────────────────────────
    extracted = extract_resume(pdf_bytes, filename, company_id=company_id)

    # If we got a cached DB row back, it already has all fields — return fast
    if extracted.get("score") is not None and extracted.get("id"):
        print(f"[CACHE HIT] Returning cached result for {filename}")
        extracted["skills"] = (
            json.loads(extracted["skills"])
            if isinstance(extracted.get("skills"), str)
            else (extracted.get("skills") or [])
        )
        return extracted

    # ── 2. External API fetches ──────────────────────────────────────────────
    lc = get_leetcode_stats(extracted.get("leetcode_username"))
    gh = get_github_stats(extracted.get("github_username"))

    # ── 3. Scoring ──────────────────────────────────────────────────────────
    weights = {
        "cgpa":     company["weight_cgpa"],
        "leetcode": company["weight_leetcode"],
        "github":   company["weight_github"],
        "skills":   company["weight_skills"],
    }
    student_data = {
        **extracted,
        "lc_easy":   lc["easy"],
        "lc_medium": lc["medium"],
        "lc_hard":   lc["hard"],
        "gh_repos":  gh["repos"],
        "gh_stars":  gh["stars"],
        "gh_commits": gh["recent_commits"],
    }
    result = calculate_score(student_data, weights, company["required_skills"])

    # ── 4. Upsert into DB ───────────────────────────────────────────────────
    skills_json = json.dumps(extracted.get("skills") or [])
    conn = get_db()
    conn.execute(
        """INSERT INTO students
           (company_id, filename, file_hash, name, email, cgpa, skills,
            leetcode_username, github_username,
            lc_easy, lc_medium, lc_hard, lc_total, lc_ranking,
            gh_repos, gh_top_lang, gh_stars, gh_commits,
            score, recommendation, status)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
           ON CONFLICT(company_id, file_hash) DO UPDATE SET
               filename          = excluded.filename,
               name              = excluded.name,
               email             = excluded.email,
               cgpa              = excluded.cgpa,
               skills            = excluded.skills,
               leetcode_username  = excluded.leetcode_username,
               github_username   = excluded.github_username,
               lc_easy           = excluded.lc_easy,
               lc_medium         = excluded.lc_medium,
               lc_hard           = excluded.lc_hard,
               lc_total          = excluded.lc_total,
               lc_ranking        = excluded.lc_ranking,
               gh_repos          = excluded.gh_repos,
               gh_top_lang       = excluded.gh_top_lang,
               gh_stars          = excluded.gh_stars,
               gh_commits        = excluded.gh_commits,
               score             = excluded.score,
               recommendation    = excluded.recommendation,
               status            = excluded.status
        """,
        (
            company_id,
            extracted.get("filename", filename),
            extracted["file_hash"],
            extracted.get("name"),
            extracted.get("email"),
            extracted.get("cgpa"),
            skills_json,
            extracted.get("leetcode_username"),
            extracted.get("github_username"),
            lc["easy"], lc["medium"], lc["hard"], lc["total"], lc["ranking"],
            gh["repos"], gh.get("top_language"), gh["stars"], gh["recent_commits"],
            result["score"], result["recommendation"], "done",
        ),
    )
    conn.commit()
    conn.close()

    # ── 5. Build response ───────────────────────────────────────────────────
    return {
        # Student info
        "filename":           extracted.get("filename", filename),
        "file_hash":          extracted["file_hash"],
        "name":               extracted.get("name"),
        "email":              extracted.get("email"),
        "cgpa":               extracted.get("cgpa"),
        "skills":             extracted.get("skills") or [],
        "leetcode_username":  extracted.get("leetcode_username"),
        "github_username":    extracted.get("github_username"),
        # LeetCode stats
        "lc": lc,
        # GitHub stats
        "gh": gh,
        # Score
        "score":          result["score"],
        "recommendation": result["recommendation"],
        "breakdown":      result["breakdown"],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Upload endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/upload", methods=["POST"])
def upload_single():
    """Process a single PDF resume."""
    company_id = request.form.get("company_id")
    if not company_id:
        return jsonify({"error": "company_id is required"}), 400
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded — use field name 'file'"}), 400

    conn = get_db()
    company = _resolve_company(company_id, conn)
    conn.close()
    if not company:
        return jsonify({"error": f"Company {company_id} not found"}), 404

    file = request.files["file"]
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are accepted"}), 400

    pdf_bytes = file.read()
    try:
        result = _process_pdf(pdf_bytes, file.filename, company)
        return jsonify(result)
    except Exception as e:
        print(f"[UPLOAD ERROR] {file.filename}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/upload/bulk", methods=["POST"])
def upload_bulk():
    """Process multiple PDF resumes in one request."""
    company_id = request.form.get("company_id")
    if not company_id:
        return jsonify({"error": "company_id is required"}), 400

    files = request.files.getlist("files")
    if not files:
        return jsonify({"error": "No files uploaded — use field name 'files'"}), 400

    conn = get_db()
    company = _resolve_company(company_id, conn)
    conn.close()
    if not company:
        return jsonify({"error": f"Company {company_id} not found"}), 404

    results = []
    for file in files:
        if not file.filename.lower().endswith(".pdf"):
            results.append({"filename": file.filename, "error": "Not a PDF"})
            continue
        pdf_bytes = file.read()
        try:
            r = _process_pdf(pdf_bytes, file.filename, company)
            results.append(r)
        except Exception as e:
            print(f"[BULK ERROR] {file.filename}: {e}")
            results.append({"filename": file.filename, "error": str(e)})

    # Sort by score descending
    results.sort(key=lambda x: x.get("score", 0), reverse=True)
    return jsonify({"total": len(results), "results": results})


# ─────────────────────────────────────────────────────────────────────────────
# Students endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/students/<int:company_id>", methods=["GET"])
def get_students(company_id):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM students WHERE company_id = ? ORDER BY score DESC",
        (company_id,),
    ).fetchall()
    conn.close()
    students = []
    for r in rows:
        s = dict(r)
        try:
            s["skills"] = json.loads(s.get("skills") or "[]")
        except Exception:
            s["skills"] = []
        students.append(s)
    return jsonify(students)


@app.route("/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    conn = get_db()
    conn.execute("DELETE FROM students WHERE id = ?", (student_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Student deleted"})


# ─────────────────────────────────────────────────────────────────────────────
# Entrypoint
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    port = int(os.getenv("PORT", 5000))
    print(f"ResumeIQ backend running → http://localhost:{port}")
    app.run(debug=True, port=port, host="0.0.0.0")