import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AppUser, UserRole, UserStatus, AuditLog } from '../types';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@tatkalassist.pro',
    displayName: 'Chief System Administrator',
    role: 'admin',
    status: 'active',
    department: 'Enterprise Security & Operations',
    assignedStations: ['NDLS', 'HWH', 'CSMT'],
    createdAt: '2026-10-01T08:00:00.000Z',
    createdBy: 'System Root',
    lastLogin: 'Just now'
  },
  {
    id: 'usr-operator-01',
    email: 'operator@tatkalassist.pro',
    displayName: 'Vikram Joshi (Senior Desk)',
    role: 'operator',
    status: 'active',
    department: 'Northern Railway Desk',
    assignedStations: ['NDLS', 'BSB'],
    createdAt: '2026-10-15T09:30:00.000Z',
    createdBy: 'admin@tatkalassist.pro',
    lastLogin: '2026-10-27T08:15:00.000Z'
  },
  {
    id: 'usr-passenger-01',
    email: 'passenger@tatkalassist.pro',
    displayName: 'Arun Sharma (Personal)',
    role: 'passenger',
    status: 'active',
    department: 'Consumer Retail Booking',
    createdAt: '2026-10-20T11:00:00.000Z',
    createdBy: 'Self Registered',
    lastLogin: '2026-10-27T09:00:00.000Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    action: 'SYSTEM_BOOTSTRAP',
    targetUserEmail: 'admin@tatkalassist.pro',
    performedBy: 'System Engine',
    timestamp: '2026-10-01T08:00:00.000Z',
    details: 'Initial root system administrator provisioned'
  },
  {
    id: 'log-002',
    action: 'USER_CREATED',
    targetUserEmail: 'operator@tatkalassist.pro',
    performedBy: 'admin@tatkalassist.pro',
    timestamp: '2026-10-15T09:30:00.000Z',
    details: 'Provisioned desk operator Vikram Joshi with access to NDLS & BSB'
  }
];

// Helper to seed initial admin record in Firestore
export async function bootstrapSystemAdmin(user: AppUser) {
  try {
    const adminDocRef = doc(db, 'admins', user.id);
    await setDoc(adminDocRef, {
      uid: user.id,
      email: user.email,
      grantedAt: new Date().toISOString(),
      grantedBy: 'system'
    }, { merge: true });

    const userDocRef = doc(db, 'users', user.id);
    await setDoc(userDocRef, user, { merge: true });
  } catch (err) {
    console.warn('Bootstrap admin sync notice:', err);
  }
}

// Fetch all users from Firestore with local fallback
export async function fetchUsersFromFirestore(): Promise<AppUser[]> {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    if (!snapshot.empty) {
      const users: AppUser[] = [];
      snapshot.forEach(docSnap => {
        users.push(docSnap.data() as AppUser);
      });
      return users;
    }
  } catch (err) {
    console.warn('Could not fetch from Firestore, using local cache:', err);
  }

  // Load from localStorage cache
  try {
    const cached = localStorage.getItem('tatkal_users_directory');
    if (cached) return JSON.parse(cached);
  } catch {
    // fallback
  }

  return INITIAL_USERS;
}

// Fetch audit logs
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
  } catch {
    // fallback
  }

  return INITIAL_AUDIT_LOGS;
}

// Record an audit log
export async function logAdminAction(
  action: string,
  targetUserEmail: string,
  performedBy: string,
  details: string
): Promise<AuditLog> {
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
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
    localStorage.setItem('tatkal_audit_logs', JSON.stringify([newLog, ...existing]));
  } catch {
    // ignore
  }

  return newLog;
}
