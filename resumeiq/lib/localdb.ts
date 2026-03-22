import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('[localdb] Failed to read db.json:', e);
    return { users: [], students: [], companies: [], shortlists: [] };
  }
}

function writeDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── AUTH ──────────────────────────────────────────
export function getUserByEmail(email: string) {
  const db = readDb();
  console.log('[localdb] Looking for email:', email);
  console.log('[localdb] Users in db:', db.users.length);
  const user = db.users.find((u: any) => u.email.trim() === email.trim());
  console.log('[localdb] Found user:', user ? user.name : 'NOT FOUND');
  return user || null;
}

export function getAllUsers() {
  return readDb().users;
}

export function createUser(user: any) {
  const db = readDb();
  const newUser = { id: `user_${Date.now()}`, ...user, createdAt: new Date().toISOString() };
  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

export function deleteUser(userId: string) {
  const db = readDb();
  db.users = db.users.filter((u: any) => u.id !== userId);
  writeDb(db);
}

// ── COMPANIES ─────────────────────────────────────
export function getCompanies() {
  return readDb().companies;
}

export function getCompanyById(id: string) {
  const db = readDb();
  return db.companies.find((c: any) => c.id === id) || null;
}

export function createCompany(company: any) {
  const db = readDb();
  const newCompany = { id: `company_${Date.now()}`, ...company, createdAt: new Date().toISOString() };
  db.companies.push(newCompany);
  writeDb(db);
  return newCompany;
}

export function deleteCompany(id: string) {
  const db = readDb();
  db.companies = db.companies.filter((c: any) => c.id !== id);
  writeDb(db);
}

// ── STUDENTS ──────────────────────────────────────
export function getStudents() {
  return readDb().students;
}

export function getStudentById(id: string) {
  const db = readDb();
  return db.students.find((s: any) => s.id === id) || null;
}

export function createStudent(id: string, student: any) {
  const db = readDb();
  const existing = db.students.findIndex((s: any) => s.id === id);
  if (existing !== -1) {
    db.students[existing] = { id, ...student };
  } else {
    db.students.push({ id, ...student });
  }
  writeDb(db);
}

export function updateStudent(id: string, data: any) {
  const db = readDb();
  const idx = db.students.findIndex((s: any) => s.id === id);
  if (idx !== -1) db.students[idx] = { ...db.students[idx], ...data };
  writeDb(db);
}

// ── SHORTLISTS ────────────────────────────────────
export function getShortlists(companyId?: string) {
  const db = readDb();
  if (companyId) return db.shortlists.filter((s: any) => s.companyId === companyId);
  return db.shortlists;
}

export function createShortlist(data: any) {
  const db = readDb();
  const newItem = { id: `shortlist_${Date.now()}_${Math.random().toString(36).slice(2)}`, ...data };
  db.shortlists.push(newItem);
  writeDb(db);
  return newItem;
}

export function updateShortlistRank(id: string, rank: number) {
  const db = readDb();
  const idx = db.shortlists.findIndex((s: any) => s.id === id);
  if (idx !== -1) db.shortlists[idx].rank = rank;
  writeDb(db);
}

export function getStats() {
  const db = readDb();
  return {
    usersCount: db.users.length,
    studentsCount: db.students.length,
    companiesCount: db.companies.length,
    shortlistsCount: db.shortlists.length,
  };
}