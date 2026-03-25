"""
extractor.py
------------
Extracts structured data from resume PDFs using Groq (llama-3.1-8b-instant).
MD5 hash of the PDF bytes is used as a cache key — if the file was already
processed for the SAME company, we return the stored record and skip the API.
"""

import os
import re
import json
import hashlib

import fitz                     # PyMuPDF
from groq import Groq
from dotenv import load_dotenv

from database import get_db

_HERE = os.path.dirname(os.path.abspath(__file__))
_ENV_PATH = os.path.join(_HERE, ".env")
load_dotenv(_ENV_PATH, override=True)

# --- Startup diagnostic (runs on import) ---
_startup_key = os.getenv("GROQ_API_KEY", "")
print(f"[ENV] .env path   : {_ENV_PATH}")
print(f"[ENV] .env exists : {os.path.isfile(_ENV_PATH)}")
print(f"[ENV] GROQ_API_KEY: {'NOT SET' if not _startup_key else _startup_key[:4] + '****'}")

# ---------------------------------------------------------------------------
# Groq client (lazy singleton)
# ---------------------------------------------------------------------------
_client = None

def _get_client():
    global _client
    if _client is None:
        # Force-reload .env using an absolute path so we never rely on CWD.
        load_dotenv(_ENV_PATH, override=True)

        api_key = os.getenv("GROQ_API_KEY", "")
        print(f"[GROQ CLIENT] Key starts with: {'NOT SET' if not api_key else api_key[:4] + '****'}")

        if not api_key:
            raise RuntimeError(
                f"GROQ_API_KEY is missing or empty.\n"
                f"  .env path checked: {_ENV_PATH}\n"
                f"  Add this line to the file:\n"
                f"  GROQ_API_KEY=your_key_here"
            )
        _client = Groq(api_key=api_key)
    return _client


# ---------------------------------------------------------------------------
# Prompt sent to the LLM
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are a resume parser. Return ONLY a valid raw JSON object — "
    "no markdown, no code fences, no explanation, no extra text."
)

USER_PROMPT_TEMPLATE = """Extract the following fields from the resume text below and return them as a single JSON object.

Fields:
- name          (string)
- email         (string or null)
- cgpa          (float or null — look for GPA / CGPA / percentage converted to 10-point scale)
- skills        (array of strings — programming languages, frameworks, tools)
- leetcode_username  (string or null — look for leetcode.com/username)
- github_username    (string or null — look for github.com/username)

Rules:
• If a field is not found, use null (not "N/A", not empty string).
• skills must be an array even if only one skill is found.
• CGPA: if percentage is given (e.g. 85%), convert as cgpa = percentage / 10.
• For usernames extract ONLY the username part, not the full URL.

Resume:
{text}"""


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_file_hash(pdf_bytes: bytes) -> str:
    return hashlib.md5(pdf_bytes).hexdigest()


def pdf_to_text(pdf_bytes: bytes) -> str:
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages = [page.get_text() for page in doc]
        return "\n".join(pages)
    except Exception as e:
        print(f"[PDF ERROR] Could not extract text: {e}")
        return ""


def check_cache(file_hash: str, company_id) -> dict | None:
    """Return existing student record if the same PDF was already processed
    for this company, otherwise None."""
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM students WHERE file_hash = ? AND company_id = ?",
        (file_hash, company_id)
    ).fetchone()
    conn.close()
    if row:
        d = dict(row)
        try:
            d["skills"] = json.loads(d.get("skills") or "[]")
        except Exception:
            d["skills"] = []
        return d
    return None


def _strip_fences(raw: str) -> str:
    """Remove markdown code fences if the model wrapped its JSON in them."""
    raw = raw.strip()
    # Remove ```json ... ``` or ``` ... ```
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


def parse_json_safe(raw: str) -> dict:
    """Try to parse JSON; if it fails, attempt to extract the first {...} block."""
    raw = _strip_fences(raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Last-resort: find first {...} in the output
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            return json.loads(match.group())
        raise


def _fallback(filename: str) -> dict:
    return {
        "name": filename.replace(".pdf", "").replace("_", " ").title(),
        "email": None,
        "cgpa": None,
        "skills": [],
        "leetcode_username": None,
        "github_username": None,
    }


# ---------------------------------------------------------------------------
# Main public function
# ---------------------------------------------------------------------------

def extract_resume(pdf_bytes: bytes, filename: str, company_id=None) -> dict:
    """
    1. Hash the PDF bytes.
    2. Return cached record if already processed for this company.
    3. Otherwise call Groq API and return parsed data.
    """
    file_hash = get_file_hash(pdf_bytes)

    # Cache check
    if company_id is not None:
        cached = check_cache(file_hash, company_id)
        if cached:
            print(f"[CACHE HIT] {filename} — skipping API call")
            return cached

    # Extract text from PDF
    text = pdf_to_text(pdf_bytes)
    if not text.strip():
        print(f"[WARN] No text extracted from {filename} — using fallback")
        data = _fallback(filename)
        data["file_hash"] = file_hash
        data["filename"] = filename
        return data

    # Truncate to stay well within token limits (≈ 6 000 characters)
    text = text[:6000]

    # Call Groq
    print(f"[GROQ] Calling llama-3.1-8b-instant for {filename} …")
    try:
        client = _get_client()
        chat = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": USER_PROMPT_TEMPLATE.format(text=text)},
            ],
            temperature=0.0,
            max_tokens=512,
        )
        raw = chat.choices[0].message.content or ""
        print(f"[GROQ RAW] {raw[:300]}")
        data = parse_json_safe(raw)
    except Exception as e:
        print(f"[GROQ ERROR] {filename}: {e} — using fallback")
        data = _fallback(filename)

    # Normalise types
    data.setdefault("name", None)
    data.setdefault("email", None)
    data.setdefault("cgpa", None)
    data.setdefault("skills", [])
    data.setdefault("leetcode_username", None)
    data.setdefault("github_username", None)

    # Ensure skills is a list
    if isinstance(data["skills"], str):
        data["skills"] = [s.strip() for s in data["skills"].split(",") if s.strip()]

    # Clamp CGPA to [0, 10]
    if data["cgpa"] is not None:
        try:
            cgpa = float(data["cgpa"])
            data["cgpa"] = round(min(max(cgpa, 0.0), 10.0), 2)
        except (ValueError, TypeError):
            data["cgpa"] = None

    # Strip URL parts from usernames
    for key in ("leetcode_username", "github_username"):
        val = data.get(key)
        if val:
            # e.g. "https://github.com/johndoe" → "johndoe"
            val = val.rstrip("/").split("/")[-1].strip()
            data[key] = val if val else None

    data["file_hash"] = file_hash
    data["filename"] = filename
    return data