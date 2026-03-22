import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * GET /api/cleanup-all
 * Deletes ALL documents from students, shortlists, and scores collections.
 * Companies collection is intentionally preserved.
 */
export async function GET() {
  const results: Record<string, number> = {
    students: 0,
    shortlists: 0,
    scores: 0,
  };

  const collectionsToClean = ['students', 'shortlists', 'scores'] as const;

  for (const colName of collectionsToClean) {
    const snap = await adminDb.collection(colName).get();
    for (const d of snap.docs) {
      await adminDb.collection(colName).doc(d.id).delete();
      results[colName]++;
    }
    console.log(`Deleted ${results[colName]} docs from ${colName}`);
  }

  return NextResponse.json({
    success: true,
    message: 'Cleanup complete. Companies collection preserved.',
    deleted: results,
  });
}
