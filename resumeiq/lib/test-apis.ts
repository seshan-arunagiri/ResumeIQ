import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { writeFileSync, unlinkSync } from 'fs';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function testAll() {
  const { app } = await import('./firebase');
  const { callGemini } = await import('./gemini');
  const { fetchGitHubData } = await import('./github');
  const { fetchLeetCode } = await import('./leetcode');
  const { uploadPDF } = await import('./cloudinary');

  console.log("=== Testing API Connections ===\n");

  console.log("1. Testing Firebase...");
  if (app.name) {
    console.log("✅ Firebase initialized successfully (App Name: " + app.name + ")");
  } else {
    console.error("❌ Firebase initialization failed");
  }

  console.log("\n2. Testing Gemini...");
  try {
    const geminiRes = await callGemini("Say 'Hello from Gemini!'");
    console.log("✅ Gemini Response:", geminiRes.trim());
  } catch (e) {
    console.error("❌ Gemini Test Failed:", e);
  }

  console.log("\n3. Testing GitHub...");
  try {
    const ghRes = await fetchGitHubData("octocat");
    console.log("✅ GitHub Response User:", ghRes.name || ghRes.login);
  } catch (e) {
    console.error("❌ GitHub Test Failed:", e);
  }

  console.log("\n4. Testing LeetCode...");
  try {
    const lcRes = await fetchLeetCode("alfa");
    console.log("✅ LeetCode Response:", lcRes.username || "Success");
  } catch (e) {
    console.error("❌ LeetCode Test Failed:", e);
  }

  console.log("\n5. Testing Cloudinary...");
  try {
    const testPdfPath = "dummy_test.pdf";
    writeFileSync(testPdfPath, "Dummy PDF content for testing Cloudinary upload.");
    const cloudRes = await uploadPDF(testPdfPath);
    console.log("✅ Cloudinary Upload URL:", cloudRes);
    unlinkSync(testPdfPath);
  } catch (e) {
    console.error("❌ Cloudinary Test Failed:", e);
  }
}

testAll();
