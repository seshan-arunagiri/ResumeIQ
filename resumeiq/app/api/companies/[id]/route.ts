import { NextResponse } from 'next/server';
import { deleteCompany } from '@/lib/localdb';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    if (!id) {
        return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    deleteCompany(id);
    return NextResponse.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}
