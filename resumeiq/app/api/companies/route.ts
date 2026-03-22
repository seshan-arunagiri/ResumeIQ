import { NextResponse } from 'next/server';
import { getCompanies, createCompany, deleteCompany } from '@/lib/localdb';

export async function GET() {
  try {
    const companies = getCompanies();
    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, minCgpa, requiredSkills, minLeetcodeSolved, weights } = body;

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const newCompany = createCompany({
      name,
      minCgpa: minCgpa || 0,
      requiredSkills: requiredSkills || [],
      minLeetcodeSolved: minLeetcodeSolved || 0,
      weights: weights || { resume: 35, leetcode: 30, github: 20, cgpa: 15 },
    });

    return NextResponse.json({ company: newCompany, success: true });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    deleteCompany(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}