import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// We need to use Firebase Admin SDK to bypass client restrictions
// But since we just want a simple local script, we can initialize standard Firebase if we pass proper credentials, 
// OR use Firebase Admin if available.
// Since firebase-admin requires a service account key JSON which we might not have explicitly provided yet,
// we will use the standard client SDK to sign up the user, then forcefully write to Firestore.

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

async function createDefaultAdmin() {
  console.log("🚀 Initializing Default Admin Creation...");
  const adminEmail = "seshan.arunagiri@gmail.com";
  const adminPassword = "Seshan@123";
  const adminName = "Seshan";

  try {
    // 1. Create the user in Firebase Auth
    console.log(`Creating user in Firebase Auth: ${adminEmail}...`);
    let uid = "";
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        uid = userCredential.user.uid;
        console.log(`✅ Auth user created with UID: ${uid}`);
    } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
             console.log(`⚠️ User already exists in Auth. Looking up UID...`);
             const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
             uid = cred.user.uid;
             console.log(`✅ Fetched existing UID: ${uid}`);
        } else {
             throw authError;
        }
    }

    // 2. Create the document in the 'users' collection
    console.log(`Writing profile to Firestore 'users' collection...`);
    await setDoc(doc(db, 'users', uid), {
      name: adminName,
      email: adminEmail,
      role: 'admin',
      isActive: true,
      createdBy: 'system',
      createdAt: new Date().toISOString()
    });
    
    console.log(`✅ Profile written successfully!`);
    console.log(`🎉 Default Admin Setup Complete.`);

  } catch (err: any) {
    console.error("❌ Failed to create admin:", err.message);
  } finally {
      process.exit();
  }
}

createDefaultAdmin();
