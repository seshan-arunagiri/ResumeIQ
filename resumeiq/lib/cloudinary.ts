import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadPDF(filePath: string) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      type: 'upload',
      access_mode: 'public',
      folder: "resumeiq_pdfs"
    });

    // Force public URL — secure_url for raw files sometimes returns 401
    // Build the URL manually to guarantee it's public
    const publicUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${result.public_id}`;

    console.log('[cloudinary] Uploaded PDF:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
} 
