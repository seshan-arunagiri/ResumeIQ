import { NextResponse } from 'next/server';
import { createCompany } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Auto-generate an ID based on name or timestamp
    const companyId = `company_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const payload = {
        ...body,
        createdAt: new Date().toISOString()
    };

    await createCompany(companyId, payload);

    return NextResponse.json({ success: true, companyId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
