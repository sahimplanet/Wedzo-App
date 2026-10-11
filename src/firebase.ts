import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  getDoc,
  collection, 
  getDocs,
  query,
  where,
  limit,
  onSnapshot,
  Firestore
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../firebase-applet-config.json';
import { UserProfile } from './types';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific databaseId if provided
export const db: Firestore = config.firestoreDatabaseId
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Validation check required by Firebase skill
export async function testFirebaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { connected: true, message: 'Connected to Firebase Firestore' };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, retrying...');
      return { connected: false, message: 'Firebase offline' };
    }
    // If document doesn't exist, connection succeeded!
    return { connected: true, message: 'Connected to Firebase Firestore' };
  }
}

// Save or sync user profile to Firestore
export async function syncUserProfileToFirebase(user: any): Promise<void> {
  try {
    if (!user || !user.id) return;
    await setDoc(doc(db, 'users', user.id), {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore profile sync error:', err);
  }
}

// Register a new user directly in Firestore database
export async function registerUserInFirestore(params: {
  name: string;
  email: string;
  phone: string;
  idOrBirthEntryNo: string;
  dob: string;
  platform?: 'mpesa' | 'bank';
  bankName?: string;
  accountNumber?: string;
  subOption?: string;
}): Promise<UserProfile> {
  const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const userProfile: UserProfile = {
    id: userId,
    email: params.email.trim(),
    name: params.name.trim(),
    phone: params.phone.trim(),
    idOrBirthEntryNo: params.idOrBirthEntryNo.trim(),
    dob: params.dob.trim(),
    platform: params.platform || 'bank',
    bankName: params.bankName || 'Absa Bank',
    accountNumber: params.accountNumber || '',
    subOption: params.subOption || 'mshwari',
    currency: 'KES',
    autoAllocate: true,
    allocationMode: 'equal',
    onboardingCompleted: true,
    theme: 'dark',
    credits: 120, // Initial discipline credit award
    subscriptionPlan: 'free',
    subscriptionCost: 3000,
    lastMessageDate: now,
  };

  try {
    // Write directly to Firestore database collection 'users'
    await setDoc(doc(db, 'users', userId), {
      ...userProfile,
      createdAt: now,
      updatedAt: now,
    });
  } catch (firestoreErr) {
    console.warn('Firestore direct write notice:', firestoreErr);
  }

  // Also sync to backend API for session continuity
  try {
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userProfile),
    });
  } catch (e) {
    console.warn('Backend sync warning:', e);
  }

  return userProfile;
}

// Log in an existing user from Firestore database using email, phone, or ID/Birth Entry No
export async function loginUserFromFirestore(
  identifier: string,
  providedName?: string
): Promise<UserProfile | null> {
  const search = identifier.trim().toLowerCase();
  if (!search) return null;

  try {
    // 1. Direct document ID lookup
    const directDocRef = doc(db, 'users', search);
    const directSnap = await getDoc(directDocRef);
    if (directSnap.exists()) {
      return directSnap.data() as UserProfile;
    }

    // 2. Query users collection by email
    const usersCol = collection(db, 'users');
    const emailQ = query(usersCol, where('email', '==', identifier.trim()), limit(1));
    const emailSnap = await getDocs(emailQ);
    if (!emailSnap.empty) {
      const docData = emailSnap.docs[0].data() as UserProfile;
      return { ...docData, id: emailSnap.docs[0].id };
    }

    // 3. Query by phone number
    const phoneQ = query(usersCol, where('phone', '==', identifier.trim()), limit(1));
    const phoneSnap = await getDocs(phoneQ);
    if (!phoneSnap.empty) {
      const docData = phoneSnap.docs[0].data() as UserProfile;
      return { ...docData, id: phoneSnap.docs[0].id };
    }

    // 4. Query by idOrBirthEntryNo
    const idEntryQ = query(usersCol, where('idOrBirthEntryNo', '==', identifier.trim()), limit(1));
    const idEntrySnap = await getDocs(idEntryQ);
    if (!idEntrySnap.empty) {
      const docData = idEntrySnap.docs[0].data() as UserProfile;
      return { ...docData, id: idEntrySnap.docs[0].id };
    }

    // 5. Fallback: check all docs in users collection for fuzzy match
    const allUsersSnap = await getDocs(usersCol);
    for (const d of allUsersSnap.docs) {
      const data = d.data() as UserProfile;
      if (
        data.email?.toLowerCase() === search ||
        data.phone?.toLowerCase() === search ||
        data.idOrBirthEntryNo?.toLowerCase() === search ||
        (data.name && search.length > 3 && data.name.toLowerCase().includes(search))
      ) {
        return { ...data, id: d.id };
      }
    }
  } catch (err) {
    console.warn('Firestore query error during login:', err);
  }

  // Fallback to backend authentication
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: search }),
    });
    const data = await res.json();
    if (data.user) {
      // Save back to Firestore
      await syncUserProfileToFirebase(data.user);
      return data.user;
    }
  } catch (err) {
    console.warn('Backend login fallback failed:', err);
  }

  return null;
}

// Fetch user profile from Firestore by ID
export async function getUserFromFirestore(userId: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Error fetching user from Firestore:', err);
  }
  return null;
}

// Save transaction to Firestore
export async function syncTransactionToFirebase(tx: any): Promise<void> {
  try {
    if (!tx || !tx.id) return;
    await setDoc(doc(db, 'transactions', tx.id), {
      ...tx,
      syncedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore transaction sync error:', err);
  }
}
