import { initializeApp, getApps } from 'firebase-admin/app'
import { cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const adminApp = getApps().find(
  app => app.name === 'admin'
) || initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ?.replace(/\\n/g, '\n')
  })
}, 'admin')

export const adminDb = getFirestore(adminApp)
