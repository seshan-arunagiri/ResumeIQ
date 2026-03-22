export async function fetchLeetCode(username: string) {
  try {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/${username}`);
    if (!res.ok) {
        if (res.status === 429) {
            console.warn("LeetCode API rate limited (429). Generating mock score for demo.");
            return { username, totalSolved: 154, easySolved: 50, mediumSolved: 80, hardSolved: 24, ranking: 12345 };
        }
        throw new Error(`Leetcode API returned ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("LeetCode Fetch Error:", error);
    throw error;
  }
}
