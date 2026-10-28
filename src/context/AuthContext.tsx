import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AppUser, UserRole, UserStatus, AuditLog } from '../types';
import { 
  INITIAL_USERS, 
  fetchUsersFromFirestore, 
  fetchAuditLogsFromFirestore, 
  logAdminAction,
  bootstrapSystemAdmin
} from '../services/authService';

interface AuthContextType {
  currentUser: AppUser | null;
  isAdmin: boolean;
  isOperator: boolean;
  allUsers: AppUser[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  quickSwitchUser: (email: string) => Promise<void>;
  createNewUser: (params: {
    email: string;
    password?: string;
    displayName: string;
    role: UserRole;
    department?: string;
    assignedStations?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('tatkal_active_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default to the Chief System Administrator for easy out-of-the-box exploration
    return INITIAL_USERS[0];
  });

  const [allUsers, setAllUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and load users from Firestore
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const users = await fetchUsersFromFirestore();
        setAllUsers(users);

        // Ensure root admin is provisioned in Firestore
        if (users.length > 0 && users[0].role === 'admin') {
          await bootstrapSystemAdmin(users[0]);
        }

        const logs = await fetchAuditLogsFromFirestore();
        setAuditLogs(logs);
      } catch (err) {
        console.warn('Initial load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Save current user to local storage whenever changed
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('tatkal_active_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('tatkal_active_user');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Save all users list to local cache
  useEffect(() => {
    try {
      localStorage.setItem('tatkal_users_directory', JSON.stringify(allUsers));
    } catch {
      // ignore
    }
  }, [allUsers]);

  const login = async (email: string, password: string = 'Tatkal@2026'): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Find matching user in database
    const matched = allUsers.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!matched) {
      return { success: false, error: `No registered account found with email: ${email}` };
    }

    if (matched.status === 'suspended') {
      return { success: false, error: 'This user account has been suspended by System Admin.' };
    }

    // Attempt Firebase auth sign in or local fallback
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
    } catch (fbErr: any) {
      // If user is not yet created in Firebase Auth, create it dynamically
      try {
        await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      } catch {
        // Fallback to local session
      }
    }

    const updatedUser: AppUser = {
      ...matched,
      lastLogin: new Date().toISOString()
    };

    setCurrentUser(updatedUser);

    // Update in state and Firestore
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    try {
      await setDoc(doc(db, 'users', updatedUser.id), updatedUser, { merge: true });
      const newLog = await logAdminAction('USER_LOGIN', updatedUser.email, updatedUser.email, 'User logged into application session');
      setAuditLogs(prev => [newLog, ...prev]);
    } catch {
      // ignore
    }

    return { success: true };
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    if (currentUser) {
      await logAdminAction('USER_LOGOUT', currentUser.email, currentUser.email, 'User session terminated');
    }
    setCurrentUser(null);
  };

  const quickSwitchUser = async (email: string) => {
    await login(email, 'Tatkal@2026');
  };

  const createNewUser = async (params: {
    email: string;
    password?: string;
    displayName: string;
    role: UserRole;
    department?: string;
    assignedStations?: string[];
  }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Only System Administrators can provision users.' };
    }

    const trimmedEmail = params.email.trim().toLowerCase();
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const existing = allUsers.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, error: `A user with email ${trimmedEmail} already exists.` };
    }

    if (!params.displayName.trim() || params.displayName.trim().length < 3) {
      return { success: false, error: 'Full Name must be at least 3 characters.' };
    }

    const newId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newUser: AppUser = {
      id: newId,
      email: trimmedEmail,
      displayName: params.displayName.trim(),
      role: params.role,
      status: 'active',
      department: params.department?.trim() || 'General Operations',
      assignedStations: params.assignedStations || ['NDLS', 'HWH'],
      createdAt: new Date().toISOString(),
      createdBy: currentUser.email,
      lastLogin: 'Never'
    };

    // Try creating in Firebase Auth
    const tempPassword = params.password || 'Tatkal@2026';
    try {
      await createUserWithEmailAndPassword(auth, trimmedEmail, tempPassword);
    } catch {
      // Proceed with Firestore storage
    }

    // Persist to Firestore
    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
      if (newUser.role === 'admin') {
        await setDoc(doc(db, 'admins', newUser.id), {
          uid: newUser.id,
          email: newUser.email,
          grantedAt: new Date().toISOString(),
          grantedBy: currentUser.email
        });
      }
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }

    // Log administrative action
    const newLog = await logAdminAction(
      'USER_CREATED',
      newUser.email,
      currentUser.email,
      `Created ${newUser.role.toUpperCase()} account for "${newUser.displayName}" (${newUser.department})`
    );

    setAllUsers(prev => [newUser, ...prev]);
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    if (!currentUser || currentUser.role !== 'admin') return;

    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;

    const updated = { ...targetUser, status };
    setAllUsers(prev => prev.map(u => u.id === userId ? updated : u));

    try {
      await updateDoc(doc(db, 'users', userId), { status });
      const newLog = await logAdminAction(
        status === 'active' ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
        targetUser.email,
        currentUser.email,
        `Account status modified to ${status.toUpperCase()}`
      );
      setAuditLogs(prev => [newLog, ...prev]);
    } catch {
      // fallback
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    if (!currentUser || currentUser.role !== 'admin') return;

    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;

    const updated = { ...targetUser, role };
    setAllUsers(prev => prev.map(u => u.id === userId ? updated : u));

    try {
      await updateDoc(doc(db, 'users', userId), { role });
      if (role === 'admin') {
        await setDoc(doc(db, 'admins', userId), {
          uid: userId,
          email: targetUser.email,
          grantedAt: new Date().toISOString(),
          grantedBy: currentUser.email
        });
      } else {
        await deleteDoc(doc(db, 'admins', userId)).catch(() => {});
      }
      const newLog = await logAdminAction(
        'ROLE_CHANGED',
        targetUser.email,
        currentUser.email,
        `Role updated to ${role.toUpperCase()}`
      );
      setAuditLogs(prev => [newLog, ...prev]);
    } catch {
      // fallback
    }
  };

  const deleteUser = async (userId: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;

    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;

    if (targetUser.email === 'admin@tatkalassist.pro') {
      alert('Root administrator account cannot be deleted.');
      return;
    }

    setAllUsers(prev => prev.filter(u => u.id !== userId));

    try {
      await deleteDoc(doc(db, 'users', userId));
      await deleteDoc(doc(db, 'admins', userId)).catch(() => {});
      const newLog = await logAdminAction(
        'USER_DELETED',
        targetUser.email,
        currentUser.email,
        `User account removed permanently`
      );
      setAuditLogs(prev => [newLog, ...prev]);
    } catch {
      // fallback
    }
  };

  const refreshUsers = async () => {
    const users = await fetchUsersFromFirestore();
    setAllUsers(users);
    const logs = await fetchAuditLogsFromFirestore();
    setAuditLogs(logs);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin: currentUser?.role === 'admin',
        isOperator: currentUser?.role === 'operator' || currentUser?.role === 'admin',
        allUsers,
        auditLogs,
        isLoading,
        login,
        logout,
        quickSwitchUser,
        createNewUser,
        updateUserStatus,
        updateUserRole,
        deleteUser,
        refreshUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
