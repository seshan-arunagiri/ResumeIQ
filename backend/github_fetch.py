import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


def _auth_headers():
    token = os.getenv("GITHUB_TOKEN", "").strip()
    if token:
        return {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
    return {"Accept": "application/vnd.github+json"}


def get_github_stats(username):
    if not username or not username.strip():
        return _default_stats()
    username = username.strip()
    headers  = _auth_headers()
    try:
        r = requests.get(
            f"https://api.github.com/users/{username}/repos",
            params={"per_page": 100, "sort": "updated", "type": "owner"},
            headers=headers, timeout=12,
        )
        if r.status_code in (404, 403):
            return _default_stats()
        r.raise_for_status()

        repos = r.json()
        repo_count, total_stars, lang_count = len(repos), 0, {}
        for repo in repos:
            if repo.get("fork"):
                continue
            total_stars += repo.get("stargazers_count", 0)
            lang = repo.get("language")
            if lang:
                lang_count[lang] = lang_count.get(lang, 0) + 1

        top_lang = max(lang_count, key=lang_count.get) if lang_count else None

        e = requests.get(
            f"https://api.github.com/users/{username}/events/public",
            params={"per_page": 100}, headers=headers, timeout=12,
        )
        commit_count = 0
        if e.status_code == 200:
            for event in e.json():
                if event.get("type") == "PushEvent":
                    commit_count += len(event.get("payload", {}).get("commits", []))

        print(f"[GITHUB] {username} → repos={repo_count} stars={total_stars} lang={top_lang}")
        return {"repos": repo_count, "top_language": top_lang,
                "stars": total_stars, "recent_commits": commit_count}
    except Exception as e:
        print(f"[GITHUB ERROR] {username}: {e}")
        return _default_stats()


def _default_stats():
    return {"repos": 0, "top_language": None, "stars": 0, "recent_commits": 0}
