import { NextResponse } from 'next/server';
import { getAllUsers, getCompanies, getStudents, getShortlists } from '@/lib/localdb';

export async function GET() {
  try {
    const users = getAllUsers() || [];
    const companies = getCompanies() || [];
    const students = getStudents() || [];
    const shortlists = getShortlists() || [];
    
    return NextResponse.json({
      status: 'ok',
      counts: {
        users: users.filter((u: any) => u.role !== 'teacher').length,
        teachers: users.filter((u: any) => u.role === 'teacher').length,
        companies: companies.length,
        students: students.length,
        shortlists: shortlists.length,
      },
      db: { users, companies, students, shortlists }
    });
  } catch (error) {
    console.error('Error fetching debug data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data' },
      { status: 500 }
    );
  }
}
