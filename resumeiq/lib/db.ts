import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from "firebase/firestore";
import { db } from "./firebase";

// --- STUDENTS ---
export interface Student {
  name: string;
  email: string;
  cgpa: number;
  resumeUrl: string;
  githubUsername: string;
  leetcodeUsername: string;
  skills: string[];
  projects: string[];
  education: string;
  createdAt: string;
}

export async function createStudent(studentId: string, data: Student) {
  const docRef = doc(db, "students", studentId);
  await setDoc(docRef, data);
  return studentId;
}

export async function getStudent(studentId: string) {
  const docRef = doc(db, "students", studentId);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function updateStudent(studentId: string, data: Partial<Student>) {
  const docRef = doc(db, "students", studentId);
  await updateDoc(docRef, data);
}

export async function deleteStudent(studentId: string) {
  const docRef = doc(db, "students", studentId);
  await deleteDoc(docRef);
}


// --- SCORES ---
export interface Score {
  studentId: string;
  resumeScore: number;
  githubScore: number;
  leetcodeScore: number;
  cgpaScore: number;
  totalScore: number;
  updatedAt: string;
}

export async function createScore(scoreId: string, data: Score) {
  const docRef = doc(db, "scores", scoreId);
  await setDoc(docRef, data);
  return scoreId;
}

export async function getScore(scoreId: string) {
  const docRef = doc(db, "scores", scoreId);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function updateScore(scoreId: string, data: Partial<Score>) {
  const docRef = doc(db, "scores", scoreId);
  await updateDoc(docRef, data);
}

export async function deleteScore(scoreId: string) {
  const docRef = doc(db, "scores", scoreId);
  await deleteDoc(docRef);
}


// --- COMPANIES ---
export interface Company {
  name: string;
  minCgpa: number;
  requiredSkills: string[];
  minLeetcodeSolved: number;
  weights: {
    resume: number;
    leetcode: number;
    github: number;
    cgpa: number;
  };
  createdAt: string;
}

export async function createCompany(companyId: string, data: Company) {
  const docRef = doc(db, "companies", companyId);
  await setDoc(docRef, data);
  return companyId;
}

export async function getCompany(companyId: string) {
  const docRef = doc(db, "companies", companyId);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function updateCompany(companyId: string, data: Partial<Company>) {
  const docRef = doc(db, "companies", companyId);
  await updateDoc(docRef, data);
}

export async function deleteCompany(companyId: string) {
  const docRef = doc(db, "companies", companyId);
  await deleteDoc(docRef);
}


// --- SHORTLISTS ---
export interface Shortlist {
  companyId: string;
  studentId: string;
  rank: number;
  status: string;
  reason: string;
  totalScore: number;
}

export async function createShortlist(shortlistId: string, data: Shortlist) {
  const docRef = doc(db, "shortlists", shortlistId);
  await setDoc(docRef, data);
  return shortlistId;
}

export async function getShortlist(shortlistId: string) {
  const docRef = doc(db, "shortlists", shortlistId);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function updateShortlist(shortlistId: string, data: Partial<Shortlist>) {
  const docRef = doc(db, "shortlists", shortlistId);
  await updateDoc(docRef, data);
}

export async function deleteShortlist(shortlistId: string) {
  const docRef = doc(db, "shortlists", shortlistId);
  await deleteDoc(docRef);
}
