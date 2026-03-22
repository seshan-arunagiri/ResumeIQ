import { NextRequest } from 'next/server';
import { getCompanyById, createStudent, getStudentById, updateStudent, createShortlist, updateShortlistRank } from '@/lib/localdb';
import { calculateScore } from '@/utils/scoring';
import { callGemini } from '@/lib/gemini';
import { fetchGitHubData } from '@/lib/github';
import { fetchLeetCode } from '@/lib/leetcode';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

async function parseResume(resumeUrl: string, studentId: string, base64Pdf?: string) {
  let buffer: Buffer;
  if (base64Pdf) {
    buffer = Buffer.from(base64Pdf, 'base64');
    console.log('[parse] Using base64 PDF, size:', buffer.byteLength);
  } else {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const pdfRes = await fetch(resumeUrl, { signal: controller.signal });
      clearTimeout(timer);
      if (!pdfRes.ok) throw new Error(`PDF fetch failed: ${pdfRes.status}`);
      const ab = await pdfRes.arrayBuffer();
      buffer = Buffer.from(ab);
    } catch (e: unknown) {
      clearTimeout(timer);
      throw new Error(`PDF download error: ${(e as Error).message}`);
    }
  }

  let fullText = '';
  try {
    const data = await pdfParse(buffer);
    fullText = data.text || '';
    console.log('[parse] Extracted text length:', fullText.length);
  } catch (e: unknown) {
    throw new Error(`PDF parse error: ${(e as Error).message}`);
  }

  if (!fullText.trim()) throw new Error('PDF has no extractable text');

  const prompt = `Extract ONLY valid JSON from this resume. No markdown fences. Respond with ONLY the JSON object:
{"name":"","email":"","cgpa":0,"skills":[],"github_username":"","leetcode_username":"","projects":[],"education":""}
Resume Text:
${fullText.slice(0, 8000)}`;

  const geminiText = await Promise.race([
    callGemini(prompt),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini timeout after 25s')), 25000)
    )
  ]);

  const clean = geminiText.replace(/```json/gi, '').replace(/```/g, '').trim();
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(clean);
  } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Gemini returned non-JSON: ' + clean.slice(0, 100));
    parsed = JSON.parse(match[0]);
  }

  const studentData = {
    name: String(parsed.name || ''),
    email: String(parsed.email || ''),
    cgpa: Number(parsed.cgpa) || 0,
    resumeUrl,
    githubUsername: String(parsed.github_username || ''),
    leetcodeUsername: String(parsed.leetcode_username || ''),
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    education: String(parsed.education || ''),
    createdAt: new Date().toISOString(),
  };

  const existing = getStudentById(studentId);
  if (existing) {
    updateStudent(studentId, studentData);
  } else {
    createStudent(studentId, studentData);
  }

  console.log(`[parse] Saved student: "${studentData.name}" (${studentId})`);
  return studentData;
}

async function fetchProfiles(githubUsername: string, leetcodeUsername: string) {
  let githubData: Record<string, unknown> = {};
  let leetcodeData: Record<string, unknown> = {};

  if (githubUsername) {
    try {
      const gh = await Promise.race([
        fetchGitHubData(githubUsername),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('GitHub timeout')), 10000))
      ]);
      githubData = gh.stats || {};
    } catch (e: unknown) {
      console.warn('[profiles] GitHub failed:', (e as Error).message);
    }
  }

  if (leetcodeUsername) {
    try {
      const lc = await Promise.race([
        fetchLeetCode(leetcodeUsername),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('LeetCode timeout')), 10000))
      ]);
      leetcodeData = lc || {};
    } catch (e: unknown) {
      console.warn('[profiles] LeetCode failed:', (e as Error).message);
    }
  }

  return { githubData, leetcodeData };
}

async function processOne(
  resumeUrl: string,
  company: any,
  companyId: string,
  studentId: string,
  base64Pdf?: string
) {
  let student: Record<string, unknown>;
  try {
    student = await parseResume(resumeUrl, studentId, base64Pdf);
  } catch (e: unknown) {
    const msg = (e as Error).message;
    console.error(`[process] PARSE FAILED for ${studentId}:`, msg);
    return { shortlistDocId: null, studentId, name: 'Parse Failed', totalScore: 0, status: 'Not Recommended', error: msg };
  }

  const { githubData, leetcodeData } = await fetchProfiles(
    student.githubUsername as string,
    student.leetcodeUsername as string
  );

  let scoreResult;
  try {
    scoreResult = await calculateScore({ ...student, studentId }, githubData, leetcodeData, { ...company, companyId });
  } catch (e: unknown) {
    const msg = (e as Error).message;
    console.error(`[process] SCORE FAILED for ${studentId}:`, msg);
    scoreResult = {
      finalScore: 0,
      breakdown: { resumeScore: 0, githubScore: 0, leetcodeScore: 0, cgpaScore: 0 },
      status: 'Not Recommended',
      reason: 'Scoring error: ' + msg
    };
  }

  console.log(`[process] Score: ${scoreResult.finalScore.toFixed(1)} | ${scoreResult.status} | ${student.name}`);

  try {
    const saved = createShortlist({
      companyId,
      studentId,
      studentName: student.name,
      studentEmail: student.email,
      cgpa: student.cgpa,
      resumeScore: scoreResult.breakdown.resumeScore,
      githubScore: scoreResult.breakdown.githubScore,
      leetcodeScore: scoreResult.breakdown.leetcodeScore,
      cgpaScore: scoreResult.breakdown.cgpaScore,
      totalScore: scoreResult.finalScore,
      status: scoreResult.status,
      reason: scoreResult.reason,
      rank: 0,
      createdAt: new Date().toISOString(),
    });

    console.log(`[process] Shortlist saved: ${saved.id}`);
    return {
      shortlistDocId: saved.id,
      studentId,
      name: student.name as string,
      totalScore: scoreResult.finalScore,
      status: scoreResult.status
    };
  } catch (e: unknown) {
    const msg = (e as Error).message;
    console.error(`[process] SAVE FAILED:`, msg);
    return {
      shortlistDocId: null,
      studentId,
      name: student.name as string,
      totalScore: scoreResult.finalScore,
      status: scoreResult.status,
      error: msg
    };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { resumeUrls, companyId, base64Pdfs } = body;

  if (!resumeUrls || !Array.isArray(resumeUrls) || !companyId) {
    return new Response('Missing required fields', { status: 400 });
  }

  const company = getCompanyById(companyId);
  if (!company) {
    return new Response('Invalid companyId', { status: 404 });
  }

  console.log('=== BATCH START === company:', companyId, '| resumes:', resumeUrls.length);

  const total = resumeUrls.length;
  let processed = 0;
  const results: Record<string, unknown>[] = [];

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  const send = (data: unknown) => {
    try { writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch { }
  };

  send({ type: 'progress', processed: 0, total, percent: 0 });

  (async () => {
    try {
      for (let i = 0; i < resumeUrls.length; i++) {
        const url = resumeUrls[i];
        const studentId = `student_${companyId}_${Date.now()}_${i}`;

        console.log(`[batch] Processing ${i + 1}/${total}: ${studentId}`);
        const result = await processOne(url, company, companyId, studentId, base64Pdfs?.[i]);
        results.push(result);

        processed++;
        const percent = Math.round((processed / total) * 100);
        send({ type: 'progress', processed, total, percent });
        console.log(`[batch] Progress: ${processed}/${total} (${percent}%)`);
      }

      const ranked = results
        .filter(r => !r.error)
        .sort((a, b) => (b.totalScore as number) - (a.totalScore as number))
        .map((r, idx) => ({ ...r, rank: idx + 1 }));

      for (const r of ranked) {
        const docId = (r as any).shortlistDocId;
        if (docId) {
          try { updateShortlistRank(docId, (r as any).rank); } catch { }
        }
      }

      send({ type: 'complete', results: ranked });
      console.log('=== BATCH COMPLETE === processed:', processed, '/', total);

    } catch (e: unknown) {
      send({ type: 'error', message: (e as Error).message });
      console.error('[batch] Fatal error:', (e as Error).message);
    } finally {
      try { writer.close(); } catch { }
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}