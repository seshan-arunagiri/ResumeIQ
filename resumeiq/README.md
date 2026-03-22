# ResumeIQ

AI-Powered Campus Placement Screening and Candidate Ranking System.

## Overview
ResumeIQ allows university placement cells to drag-and-drop hundreds of student resumes, automatically parses them using Gemini 1.5 Flash AI, enriches the profile with GitHub and LeetCode statistics, scores them against custom company role weights, and outputs actionable PDF and Excel shortlists.

## Tech Stack
- Frontend: Next.js 14 (App Router), React, Tailwind CSS
- Backend: Next.js API Routes, Server-Sent Events (SSE)
- Database/Auth: Firebase Auth, Firestore
- Storage: Cloudinary (PDF handling)
- AI Parser: Google Gemini API
- External APIs: GitHub REST API, Alfa LeetCode API

## Getting Started

### 1. Environment Variables
Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

**Required Keys:**
- `NEXT_PUBLIC_FIREBASE_*`: Your Firebase project configuration.
- `GEMINI_API_KEY`: Google AI Studio API key.
- `GITHUB_TOKEN`: GitHub Personal Access Token.
- `CLOUDINARY_*`: Cloudinary API keys for secure PDF storage.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

## Usage
1. Sign in with a Firebase-registered Teacher account.
2. Go to **Companies** and set a Target Role (scoring criteria & weights).
3. Go to **Upload**, drag & drop PDF resumes.
4. Go to **Dashboard** to view the AI-ranked leaderboard.
5. Hit **Export PDF** or **Export Excel** to download the shortlist.
