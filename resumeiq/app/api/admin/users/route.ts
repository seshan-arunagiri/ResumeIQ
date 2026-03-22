import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, targetUid, email, password, name, role, adminUid } = body;

    // Security Check: Verify adminUid is an admin
    const adminRef = doc(db, 'users', adminUid);
    const adminSnap = await getDoc(adminRef);
    if (!adminSnap.exists() || adminSnap.data().role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: User is not an admin' }, { status: 403 });
    }
    const adminEmail = adminSnap.data().email;

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (action === 'create') {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            password: password,
            displayName: name
          })
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const uid = data.localId;

      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        name: name,
        email: email,
        role: role, // (teacher or admin)
        createdBy: adminEmail,
        createdAt: new Date().toISOString(),
        isActive: true
      });

      return NextResponse.json({ success: true, uid, email, name, role });
    }

    if (action === 'remove') {
      if (adminUid === targetUid) {
        return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
      }

      const targetRef = doc(db, 'users', targetUid);
      const targetDoc = await getDoc(targetRef);
      if (targetDoc.exists() && targetDoc.data().role === 'admin') {
        const q = query(collection(db, 'users'), where('role', '==', 'admin'), where('isActive', '==', true));
        const adminsSnap = await getDocs(q);
        if (adminsSnap.size <= 1) {
          return NextResponse.json({ error: 'Must have at least 1 active admin' }, { status: 400 });
        }
      }

      await updateDoc(targetRef, { isActive: false });
      return NextResponse.json({ success: true });
    }

    if (action === 'reset_password') {
      if (adminUid === targetUid) {
        return NextResponse.json({ error: 'Cannot reset your own password from this panel' }, { status: 400 });
      }

      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            localId: targetUid,
            password: password,
            returnSecureToken: false
          })
        }
      );
      
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
