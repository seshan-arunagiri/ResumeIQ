"""
scorer.py
---------
Scores a student out of 100 using a weighted formula:

  CGPA           → 20 % (default)
  LeetCode       → 30 %  hard×3, medium×2, easy×1  (capped at 200 weighted points)
  GitHub         → 20 %  repos, stars, and recent commits combined
  Skills match   → 30 %  fraction of required skills found in student's skill list

All weights are passed in so the teacher can customise them per company.
"""


def calculate_score(
    student: dict,
    weights: dict,
    required_skills: str,
) -> dict:
    """
    Parameters
    ----------
    student         : flat dict with lc_easy/medium/hard, gh_repos, gh_stars,
                      gh_commits, cgpa, skills (list), etc.
    weights         : dict with keys cgpa, leetcode, github, skills (integers, sum = 100)
    required_skills : comma-separated string of required skills from the company profile

    Returns
    -------
    dict with keys: score, recommendation, breakdown
    """
    w_cgpa     = float(weights.get("cgpa",     20))
    w_leetcode = float(weights.get("leetcode", 30))
    w_github   = float(weights.get("github",   20))
    w_skills   = float(weights.get("skills",   30))

    # ── CGPA score ────────────────────────────────────────────────────────────
    cgpa = _safe_float(student.get("cgpa"), 0.0)
    cgpa = min(max(cgpa, 0.0), 10.0)           # clamp to [0, 10]
    cgpa_score = (cgpa / 10.0) * w_cgpa

    # ── LeetCode score ────────────────────────────────────────────────────────
    easy   = _safe_int(student.get("lc_easy"),   0)
    medium = _safe_int(student.get("lc_medium"), 0)
    hard   = _safe_int(student.get("lc_hard"),   0)

    lc_weighted = (easy * 1) + (medium * 2) + (hard * 3)
    # Normalise against 200 weighted points (≈ 50 hard, or 100 medium, etc.)
    lc_score = min(lc_weighted / 200.0, 1.0) * w_leetcode

    # ── GitHub score ──────────────────────────────────────────────────────────
    repos   = _safe_int(student.get("gh_repos"),   0)
    stars   = _safe_int(student.get("gh_stars"),   0)
    commits = _safe_int(student.get("gh_commits"), 0)

    # Normalise each component independently then combine (equal sub-weights)
    repos_norm   = min(repos   / 20.0, 1.0)   # 20 repos → full marks
    stars_norm   = min(stars   / 50.0, 1.0)   # 50 stars  → full marks
    commits_norm = min(commits / 50.0, 1.0)   # 50 recent commits → full marks

    gh_score = ((repos_norm + stars_norm + commits_norm) / 3.0) * w_github

    # ── Skills match score ────────────────────────────────────────────────────
    skill_score, jd_match = _compute_skill_score(
        student.get("skills") or [], required_skills, w_skills
    )

    # ── Aggregate ─────────────────────────────────────────────────────────────
    total = round(cgpa_score + lc_score + gh_score + skill_score)
    total = min(max(total, 0), 100)            # clamp to [0, 100]

    if total >= 75:
        recommendation = "Highly Recommended"
    elif total >= 50:
        recommendation = "Recommended"
    else:
        recommendation = "Not Recommended"

    return {
        "score":          total,
        "recommendation": recommendation,
        "jdMatch":        jd_match,
        "breakdown": {
            "cgpa_score":     round(cgpa_score,   1),
            "leetcode_score": round(lc_score,     1),
            "github_score":   round(gh_score,     1),
            "skills_score":   round(skill_score,  1),
        },
    }


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _compute_skill_score(
    student_skills: list,
    required_skills: str,
    weight: float,
) -> tuple[float, int]:
    if not required_skills or not required_skills.strip():
        # No requirements → full marks
        return weight, 100

    req = [s.lower().strip() for s in required_skills.split(",") if s.strip()]
    if not req:
        return weight, 100

    # Case-insensitive partial matching (e.g. "react" matches "reactjs")
    s_skills_lower = [s.lower() for s in student_skills]
    matched = sum(
        1 for req_skill in req
        if any(req_skill in s or s in req_skill for s in s_skills_lower)
    )
    return (matched / len(req)) * weight, int(round((matched / len(req)) * 100))


def _safe_float(val, default: float) -> float:
    try:
        return float(val) if val is not None else default
    except (ValueError, TypeError):
        return default


def _safe_int(val, default: int) -> int:
    try:
        return int(val) if val is not None else default
    except (ValueError, TypeError):
        return default