import { db } from '@/lib/firebase'
import { 
  collection, getDocs, deleteDoc, 
  doc, query, where 
} from 'firebase/firestore'
import { NextResponse } from 'next/server'

export async function GET() {
  // Delete test shortlists
  const shortlistSnap = await getDocs(
    query(collection(db, 'shortlists'),
    where('companyId', '==', 'company_test_1'))
  )
  for (const d of shortlistSnap.docs) {
    await deleteDoc(doc(db, 'shortlists', d.id))
  }
  
  // Delete test company
  await deleteDoc(doc(db, 'companies', 'company_test_1'))
  
  // Delete test student
  await deleteDoc(doc(db, 'students', 'student_test_1'))

  return NextResponse.json({ 
    success: true, 
    message: "Test data cleaned up" 
  })
}
