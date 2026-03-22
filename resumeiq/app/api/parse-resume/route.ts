import { NextResponse } from 'next/server';
// No need for expect-error here
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { callGemini } from '@/lib/gemini';
import { updateStudent, createStudent } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeUrl, studentId } = body;

    if (!resumeUrl || !studentId) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // 2. Download from Cloudinary URL
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    let pdfRes: Response;
    try {
      pdfRes = await fetch(resumeUrl, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
    
    if (!pdfRes.ok) {
      console.error("PDF Fetch failed:", pdfRes.status, pdfRes.statusText, await pdfRes.text());
      if (pdfRes.status === 401 && resumeUrl.includes("cloudinary.com")) {
        throw new Error("Cloudinary blocked PDF delivery. Please enable 'Allow delivery of PDF and ZIP files' in Cloudinary Security Settings.");
      }
      throw new Error("Failed to fetch PDF: " + pdfRes.statusText);
    }
    const arrayBuffer = await pdfRes.arrayBuffer();

    // 3. Extract text
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true
    });
    
    // @ts-ignore
    const pdf = await Promise.race([
      loadingTask.promise,
      new Promise<any>((_, reject) => setTimeout(() => {
          try { loadingTask.destroy(); } catch (e) {}
          reject(new Error('PDF extraction timeout after 15s'));
      }, 15000))
    ]);
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
    }

    // 4. Send to Gemini
    const prompt = `Extract ONLY valid JSON from this resume:
{ "name": "", "email": "", "cgpa": 0, "skills": [], "github_username": "", "leetcode_username": "", "projects": [], "education": "" }
Resume Text:
${fullText.slice(0, 8000)}`;

    const geminiRes = await Promise.race([
      callGemini(prompt),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Gemini timeout after 25s')), 25000))
    ]);
    
    // Parse the JSON. Gemini might wrap in ```json ... ```
    const jsonStr = geminiRes.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsedData = JSON.parse(jsonStr);

    // 5. Save to Firestore.
    try {
      await updateStudent(studentId, {
        name: parsedData.name || "",
        email: parsedData.email || "",
        cgpa: Number(parsedData.cgpa) || 0,
        skills: parsedData.skills || [],
        githubUsername: parsedData.github_username || "",
        leetcodeUsername: parsedData.leetcode_username || "",
        projects: parsedData.projects || [],
        education: parsedData.education || "",
        resumeUrl: resumeUrl
      });
    } catch {
       // if update fails (doesn't exist), try to create it
       await createStudent(studentId, {
          name: parsedData.name || "",
          email: parsedData.email || "",
          cgpa: Number(parsedData.cgpa) || 0,
          resumeUrl: resumeUrl,
          githubUsername: parsedData.github_username || "",
          leetcodeUsername: parsedData.leetcode_username || "",
          skills: parsedData.skills || [],
          projects: parsedData.projects || [],
          education: parsedData.education || "",
          createdAt: new Date().toISOString()
       });
    }
    
    console.log("Student saved:", parsedData.name);

    // 6. 1500 ms delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 7. Return payload
    return NextResponse.json({ success: true, studentId });

  } catch (error: unknown) {
    const err = error as Error;
    console.error("Parse Resume API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
