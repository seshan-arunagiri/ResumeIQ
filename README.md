# ResumeIQ — AI-Powered Campus Placement Screener

> Transform 3 days of manual resume screening into 10 minutes of automated intelligence.

![ResumeIQ](frontend/src/assets/logo.png)

---

## What is ResumeIQ?

ResumeIQ is a full-stack AI platform built for college placement officers and teachers. 
It automatically reads student resumes, verifies their LeetCode and GitHub profiles in 
real-time, scores each candidate out of 100, and produces a ranked shortlist — ready 
to hand to any company.

---

## Features

- **AI Resume Extraction** — Uploads PDF resumes and uses Groq LLM to extract name, 
  CGPA, skills, LeetCode username, and GitHub username automatically
- **Live LeetCode Verification** — Fetches real easy/medium/hard problem counts, 
  contest rating, and global rank directly from LeetCode's GraphQL API
- **Live GitHub Analysis** — Pulls real repo count, top programming language, 
  and star count from GitHub REST API
- **Smart Scoring Engine** — Calculates a score out of 100 using configurable weights:
  - CGPA (default 20%)
  - LeetCode performance (default 30%)
  - GitHub activity (default 20%)
  - Skills match (default 30%)
- **JD Analyzer** — Paste any job description and AI auto-extracts required skills 
  and suggests optimal scoring weights
- **Live Re-ranking** — Adjust weight sliders and rankings update instantly in browser
- **Company-wise View** — Manage multiple placement drives simultaneously
- **Export** — One-click export to Excel with full student breakdown
- **MD5 Caching** — Same resume never processed twice, saves API credits

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Python Flask |
| Database | SQLite |
| AI Extraction | Groq API (llama-3.1-8b-instant) |
| PDF Parsing | PyMuPDF (fitz) |
| LeetCode Data | LeetCode GraphQL API |
| GitHub Data | GitHub REST API |
| Excel Export | SheetJS |

---

## Project Structure
