import { NextResponse } from 'next/server';

export async function POST() {
  // Since we are using localStorage on the client, the server-side logout 
  // doesn't have much to do other than return success.
  // We provide this endpoint to maintain a standard API structure.
  return NextResponse.json({ message: 'Logged out successfully' });
}
