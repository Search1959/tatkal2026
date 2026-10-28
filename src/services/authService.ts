import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppUser, UserRole, UserStatus, AuditLog } from '../types';

export function getUserDocId(email: string): string {
  return 'usr_' + email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr_admin_tatkalassist_pro',
    email: 'admin@tatkalassist.pro',
    password: 'Tatkal@2026',
    displayName: 'Chief System Administrator',
    role: 'admin',
    status: 'active',
    department: 'Enterprise Security & Operations',
    assignedStations: ['NDLS', 'HWH', 'CSMT'],
    createdAt: '2026-10-01T08:00:00.000Z',
    createdBy: 'System Root',
    lastLogin: 'Never'
  },
  {
    id: 'usr_operator_tatkalassist_pro',
    email: 'operator@tatkalassist.pro',
    password: 'Tatkal@2026',
    displayName: 'Vikram Joshi (Senior Desk)',
    role: 'operator',
    status: 'active',
    department: 'Northern Railway Desk',
    assignedStations: ['NDLS', 'BSB'],
    createdAt: '2026-10-15T09:30:00.000Z',
    createdBy: 'admin@tatkalassist.pro',
    lastLogin: 'Never'
  },
  {
    id: 'usr_passenger_tatkalassist_pro',
    email: 'passenger@tatkalassist.pro',
    password: 'Tatkal@2026',
    displayName: 'Arun Sharma (Personal)',
    role: 'passenger',
    status: 'active',
    department: 'Consumer Retail Booking',
    assignedStations: ['NDLS', 'HWH'],
    createdAt: '2026-10-20T11:00:00.000Z',
    createdBy: 'Self Registered',
    lastLogin: 'Never'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    action: 'SYSTEM_BOOTSTRAP',
    targetUserEmail: 'admin@tatkalassist.pro',
    performedBy: 'System Engine',
    timestamp: '2026-10-01T08:00:00.000Z',
    details: 'Initial root system administrator provisioned on cloud'
  }
];

// Subscribe in real-time to Firestore users collection
export function subscribeToUsers(onUpdate: (users: AppUser[]) => void, onError?: (err: any) => void) {
  try {
    const colRef = collection(db, 'users');
    return onSnapshot(colRef, (snapshot) => {
      if (!snapshot.empty) {
        const users: AppUser[] = [];
        snapshot.forEach(docSnap => {
          users.push(docSnap.data() as AppUser);
        });
        // Cache to localStorage
        try {
          localStorage.setItem('tatkal_users_directory', JSON.stringify(users));
        } catch {}
        onUpdate(users);
      }
    }, (err) => {
      console.warn('Real-time users snapshot error:', err);
      if (onError) onError(err);
    });
  } catch (err) {
    console.warn('Could not establish real-time snapshot:', err);
    return () => {};
  }
}

// Fetch single user by email directly from cloud Firestore (crucial for mobile login!)
export async function fetchUserByEmailFromFirestore(email: string): Promise<AppUser | null> {
  const trimmed = email.trim().toLowerCase();
  const directDocId = getUserDocId(trimmed);

  try {
    // 1. Try direct doc ID lookup
    const directDoc = await getDoc(doc(db, 'users', directDocId));
    if (directDoc.exists()) {
      return directDoc.data() as AppUser;
    }

    // 2. Fallback to query by email field
    const q = query(collection(db, 'users'), where('email', '==', trimmed), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return querySnap.docs[0].data() as AppUser;
    }
  } catch (err) {
    console.warn('Direct Firestore user lookup failed:', err);
  }

  // Fallback to initial seed accounts
  const seedMatch = INITIAL_USERS.find(u => u.email.toLowerCase() === trimmed);
  return seedMatch || null;
}

// Fetch all users from Firestore with fallback
export async function fetchUsersFromFirestore(): Promise<AppUser[]> {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    if (!snapshot.empty) {
      const users: AppUser[] = [];
      snapshot.forEach(docSnap => {
        users.push(docSnap.data() as AppUser);
      });
      try {
        localStorage.setItem('tatkal_users_directory', JSON.stringify(users));
      } catch {}
      return users;
    }
  } catch (err) {
    console.warn('Could not fetch from Firestore, checking local cache:', err);
  }

  try {
    const cached = localStorage.getItem('tatkal_users_directory');
    if (cached) return JSON.parse(cached);
  } catch {}

  return INITIAL_USERS;
}

// Persist or update a user document in Firestore
export async function saveUserToFirestore(user: AppUser): Promise<void> {
  const docId = user.id || getUserDocId(user.email);
  const userWithId = { ...user, id: docId };
  
  await setDoc(doc(db, 'users', docId), userWithId, { merge: true });

  if (user.role === 'admin') {
    await setDoc(doc(db, 'admins', docId), {
      uid: docId,
      email: user.email,
      grantedAt: new Date().toISOString(),
      grantedBy: user.createdBy || 'admin'
    }, { merge: true });
  }
}

// Delete user from Firestore
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId));
  await deleteDoc(doc(db, 'admins', userId)).catch(() => {});
}

// Fetch audit logs from Firestore
export async function fetchAuditLogsFromFirestore(): Promise<AuditLog[]> {
  try {
    const snapshot = await getDocs(query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50)));
    if (!snapshot.empty) {
      const logs: AuditLog[] = [];
      snapshot.forEach(docSnap => {
        logs.push(docSnap.data() as AuditLog);
      });
      return logs;
    }
  } catch (err) {
    console.warn('Could not fetch audit logs from Firestore:', err);
  }

  try {
    const cached = localStorage.getItem('tatkal_audit_logs');
    if (cached) return JSON.parse(cached);
  } catch {}

  return INITIAL_AUDIT_LOGS;
}

// Record an audit log into Firestore
export async function logAdminAction(
  action: string,
  targetUserEmail: string,
  performedBy: string,
  details: string
): Promise<AuditLog> {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    targetUserEmail,
    performedBy,
    timestamp: new Date().toISOString(),
    details
  };

  try {
    await setDoc(doc(db, 'audit_logs', newLog.id), newLog);
  } catch (err) {
    console.warn('Audit log write error:', err);
  }

  try {
    const existing = JSON.parse(localStorage.getItem('tatkal_audit_logs') || '[]');
    localStorage.setItem('tatkal_audit_logs', JSON.stringify([newLog, ...existing.slice(0, 49)]));
  } catch {}

  return newLog;
}
