"""
jd_analyzer.py
--------------
Extracts required/preferred skills and suggests scoring weights from a Job Description.
"""
import os
import json
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SYSTEM_PROMPT = (
    "You are an expert technical recruiter and data extractor. "
    "Return ONLY a raw JSON object — no markdown, no code fences, no extra text."
)

USER_PROMPT = """Analyze the following Job Description and extract skills and suggest scoring weights.

Return ONLY a raw JSON object with these exact keys:
- required_skills: array of strings (must-have skills)
- preferred_skills: array of strings (nice-to-have skills)  
- suggested_weights: object with keys cgpa, leetcode, github, skills — integer values that sum to exactly 100

Job Description:
{text}"""


def get_client():
    api_key = os.getenv("XAI_API_KEY")
    return OpenAI(
        api_key=api_key,
        base_url="https://api.x.ai/v1"
    )


def parse_json_safe(raw):
    raw = raw.strip()
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def analyze_job_description(jd_text: str) -> dict:
    default = {
        "required_skills": [],
        "preferred_skills": [],
        "suggested_weights": {
            "cgpa": 20,
            "leetcode": 30,
            "github": 20,
            "skills": 30
        }
    }

    if not jd_text or not jd_text.strip():
        return default

    try:
        print("[JD] Calling xAI for JD analysis...")
        client = get_client()
        chat = client.chat.completions.create(
            model="grok-beta",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": USER_PROMPT.format(text=jd_text[:15000])}
            ],
            temperature=0.0,
            max_tokens=600,
        )

        raw = chat.choices[0].message.content or ""
        print(f"[JD RAW] {raw[:200]}")
        data = parse_json_safe(raw)

        return {
            "required_skills": data.get("required_skills", []),
            "preferred_skills": data.get("preferred_skills", []),
            "suggested_weights": data.get("suggested_weights", default["suggested_weights"])
        }

    except Exception as e:
        print(f"[JD ERROR] {e}")
        return default