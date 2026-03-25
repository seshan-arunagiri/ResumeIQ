import { NextResponse } from 'next/server';
import { uploadPDF } from '@/lib/cloudinary';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Write temporarily to disk because our cloudinary.ts wrapper expects a file path
    const tempFilePath = join(tmpdir(), `${Date.now()}_${file.name}`);
    await writeFile(tempFilePath, buffer);

    const url = await uploadPDF(tempFilePath);
    // Cleanup
    await unlink(tempFilePath).catch(console.error);

    return NextResponse.json({ url, success: true });
  } catch (error: any) {
    console.error("Cloudinary Upload Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
