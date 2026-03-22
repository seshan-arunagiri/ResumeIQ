import { NextResponse } from 'next/server';
import { getCompanies, getAllUsers, getShortlists, getStats } from '@/lib/localdb';

export async function GET() {
  try {
    const companies = getCompanies();
    const allUsers = getAllUsers();
    const teachers = allUsers.filter((u: any) => u.role === 'teacher');
    const shortlists = getShortlists();
    const stats = getStats();

    // Sort shortlists newest-first
    const sorted = [...shortlists].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      totalResumes: stats.studentsCount,
      totalCompanies: companies.length,
      totalTeachers: teachers.length,
      shortlists: sorted,        // all shortlists
      companies: companies,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

