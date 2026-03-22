import { NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/lib/localdb';

export async function GET() {
  try {
    const allUsers = getAllUsers();
    // Return teachers + admins (not the super-admin), strip passwords
    const teachers = allUsers
      .filter((u: any) => u.role === 'teacher' || u.role === 'admin')
      .map(({ password, ...rest }: any) => rest);
    return NextResponse.json({ teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, department, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    // Check duplicate email
    const existing = getAllUsers().find((u: any) => u.email.trim() === email.trim());
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
    }

    const newUser = createUser({
      name,
      email,
      department: department || '',
      password,
      role: role === 'admin' ? 'admin' : 'teacher',
      isActive: true,
    });

    const { password: _pw, ...safe } = newUser;
    return NextResponse.json({ message: 'User created successfully', teacher: safe });
  } catch (error) {
    console.error('Error creating teacher/admin:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
