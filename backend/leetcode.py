import requests

LEETCODE_URL = "https://leetcode.com/graphql"

HEADERS = {
    "Content-Type": "application/json",
    "Referer":      "https://leetcode.com",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
}

QUERY = """
query getUserStats($username: String!) {
  matchedUser(username: $username) {
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
    profile {
      ranking
    }
  }
  userContestRanking(username: $username) {
    rating
    globalRanking
    attendedContestsCount
  }
}
"""


def get_leetcode_stats(username):
    if not username or not username.strip():
        return _default_stats()
    username = username.strip()
    try:
        resp = requests.post(
            LEETCODE_URL,
            json={"query": QUERY, "variables": {"username": username}},
            headers=HEADERS,
            timeout=12,
        )
        resp.raise_for_status()
        body = resp.json()
        if body.get("errors") or not body.get("data", {}).get("matchedUser"):
            return _default_stats()

        user = body["data"]["matchedUser"]
        stats = {"easy": 0, "medium": 0, "hard": 0}
        for item in user.get("submitStatsGlobal", {}).get("acSubmissionNum", []):
            d = item.get("difficulty", "").lower()
            if d in stats:
                stats[d] = int(item.get("count", 0))
        stats["total"]   = stats["easy"] + stats["medium"] + stats["hard"]
        stats["ranking"] = int((user.get("profile") or {}).get("ranking") or 0)

        contest = body["data"].get("userContestRanking") or {}
        stats["contest_rating"]    = round(float(contest.get("rating") or 0), 1)
        stats["contests_attended"] = int(contest.get("attendedContestsCount") or 0)
        print(f"[LEETCODE] {username} → easy={stats['easy']} med={stats['medium']} hard={stats['hard']}")
        return stats
    except Exception as e:
        print(f"[LEETCODE ERROR] {username}: {e}")
        return _default_stats()


def _default_stats():
    return {"easy": 0, "medium": 0, "hard": 0, "total": 0,
            "ranking": 0, "contest_rating": 0.0, "contests_attended": 0}
