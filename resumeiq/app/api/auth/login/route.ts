import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/localdb';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const unsecure_users = await getUserByEmail(email);

    if (!unsecure_users) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // In a real app we'd hash the password here, but per requirements we check directly
    if (unsecure_users.password !== password) {
       return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Don't send the password back to the client
    const { password: _, ...userWithoutPassword } = unsecure_users;

    return NextResponse.json({
        user: userWithoutPassword,
        message: 'Login successful'
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error while logging in' },
      { status: 500 }
    );
  }
}
