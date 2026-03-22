import { NextResponse } from 'next/server';
import { fetchGitHubData } from '@/lib/github';
import { fetchLeetCode } from '@/lib/leetcode';
import { updateStudent, createStudent, getStudent } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { githubUsername, leetcodeUsername, studentId } = body;

    if (!studentId || !githubUsername || !leetcodeUsername) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch GitHub
    let githubStats = null;
    try {
        const ghData = await fetchGitHubData(githubUsername);
        githubStats = ghData.stats;
    } catch (e) {
        console.warn("Could not fetch full Github stats:", e);
    }

    // 2. Fetch LeetCode
    let leetcodeStats = null;
    try {
        leetcodeStats = await fetchLeetCode(leetcodeUsername);
    } catch (e) {
        console.warn("Could not fetch full Leetcode stats:", e);
    }

    // 3. Save to Firestore
    const dataToSave: Record<string, unknown> = {};
    if (githubStats) {
        dataToSave.githubStats = {
            totalRepos: githubStats.totalRepos,
            totalStars: githubStats.totalStars,
            top3Languages: githubStats.top3Languages,
            averageCommitsPerWeek: githubStats.averageCommitsPerWeek,
            longestStreak: githubStats.longestStreak,
            hasOnlyForks: githubStats.hasOnlyForks
        };
    }

    if (leetcodeStats) {
        dataToSave.leetcodeStats = {
            easySolved: leetcodeStats.easySolved || 0,
            mediumSolved: leetcodeStats.mediumSolved || 0,
            hardSolved: leetcodeStats.hardSolved || 0,
            totalSolved: leetcodeStats.totalSolved || 0
        };
    }

    const doc = await getStudent(studentId);
    if (doc) {
        await updateStudent(studentId, dataToSave);
    } else {
        await createStudent(studentId, {
            name: "", email: "", cgpa: 0, resumeUrl: "", 
            githubUsername, leetcodeUsername, 
            skills: [], projects: [], education: "",
            createdAt: new Date().toISOString(),
            ...dataToSave
        });
    }

    return NextResponse.json({ 
        success: true, 
        studentId, 
        githubStats: dataToSave.githubStats, 
        leetcodeStats: dataToSave.leetcodeStats 
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error("Fetch Profiles API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
