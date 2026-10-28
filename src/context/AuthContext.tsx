import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, UserRole, UserStatus, AuditLog } from '../types';
import { 
  INITIAL_USERS, 
  getUserDocId,
  fetchUsersFromFirestore, 
  fetchUserByEmailFromFirestore,
  fetchAuditLogsFromFirestore, 
  saveUserToFirestore,
  deleteUserFromFirestore,
  logAdminAction,
  subscribeToUsers
} from '../services/authService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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

  // Subscribe to real-time Firestore updates so desktop & mobile stay 100% in sync
  useEffect(() => {
    setIsLoading(true);

    // Initial load
    fetchUsersFromFirestore().then(users => {
      if (users && users.length > 0) {
        setAllUsers(users);
      }
      setIsLoading(false);
    });

    fetchAuditLogsFromFirestore().then(logs => {
      setAuditLogs(logs);
    });

    // Real-time listener for cross-device synchronization
    const unsubscribe = subscribeToUsers((updatedUsers) => {
      setAllUsers(updatedUsers);
      setIsLoading(false);

      // If current user was updated (e.g. status changed or role changed from another device), sync it
      setCurrentUser(curr => {
        if (!curr) return null;
        const matching = updatedUsers.find(u => u.email.toLowerCase() === curr.email.toLowerCase());
        return matching || curr;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Save current active user session to localStorage
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

  // Login handler supporting cross-device Firestore lookups
  const login = async (email: string, password: string = 'Tatkal@2026'): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // 1. Fetch user directly from Cloud Firestore (ensures mobile sees accounts created on desktop!)
    const matched = await fetchUserByEmailFromFirestore(trimmedEmail);

    if (!matched) {
      return { 
        success: false, 
        error: `No registered account found with email "${email}". Please verify the address or create this user through System Admin.` 
      };
    }

    if (matched.status === 'suspended') {
      return { 
        success: false, 
        error: 'This user account has been suspended by the System Administrator.' 
      };
    }

    // 2. Validate password
    const expectedPassword = matched.password || 'Tatkal@2026';
    if (password && password !== expectedPassword && password !== 'Tatkal@2026') {
      return { 
        success: false, 
        error: 'Incorrect password. Please verify your credentials and try again.' 
      };
    }

    // 3. Mark login timestamp
    const updatedUser: AppUser = {
      ...matched,
      lastLogin: new Date().toISOString()
    };

    setCurrentUser(updatedUser);

    // Update in Firestore
    try {
      await updateDoc(doc(db, 'users', updatedUser.id), {
        lastLogin: updatedUser.lastLogin
      });
      const newLog = await logAdminAction(
        'USER_LOGIN', 
        updatedUser.email, 
        updatedUser.email, 
        `User authenticated successfully from ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'Mobile Device' : 'Desktop'}`
      );
      setAuditLogs(prev => [newLog, ...prev]);
    } catch (err) {
      console.warn('Login metadata sync warning:', err);
    }

    return { success: true };
  };

  const logout = async () => {
    if (currentUser) {
      await logAdminAction('USER_LOGOUT', currentUser.email, currentUser.email, 'User session terminated');
    }
    setCurrentUser(null);
  };

  const quickSwitchUser = async (email: string) => {
    await login(email, 'Tatkal@2026');
  };

  // Admin user creation with direct Cloud Firestore write
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

    // Check if user already exists in cloud Firestore
    const existing = await fetchUserByEmailFromFirestore(trimmedEmail);
    if (existing) {
      return { success: false, error: `An account with email "${trimmedEmail}" already exists in the cloud database.` };
    }

    if (!params.displayName.trim() || params.displayName.trim().length < 3) {
      return { success: false, error: 'Full Name must be at least 3 characters.' };
    }

    const docId = getUserDocId(trimmedEmail);
    const newUser: AppUser = {
      id: docId,
      email: trimmedEmail,
      displayName: params.displayName.trim(),
      password: params.password || 'Tatkal@2026',
      role: params.role,
      status: 'active',
      department: params.department?.trim() || 'General Operations',
      assignedStations: params.assignedStations || ['NDLS', 'HWH'],
      createdAt: new Date().toISOString(),
      createdBy: currentUser.email,
      lastLogin: 'Never'
    };

    // 1. Persist directly to Cloud Firestore
    try {
      await saveUserToFirestore(newUser);
    } catch (err: any) {
      console.error('Failed to write user to Cloud Firestore:', err);
      return { success: false, error: `Database write failed: ${err.message || 'Check connection'}` };
    }

    // 2. Log administrative audit action in Firestore
    const newLog = await logAdminAction(
      'USER_CREATED',
      newUser.email,
      currentUser.email,
      `Provisioned ${newUser.role.toUpperCase()} account for "${newUser.displayName}" (${newUser.department}) with default access`
    );

    setAllUsers(prev => [newUser, ...prev.filter(u => u.id !== newUser.id)]);
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
    } catch (err) {
      console.warn('Status update error:', err);
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
      const newLog = await logAdminAction(
        'ROLE_CHANGED',
        targetUser.email,
        currentUser.email,
        `Role updated to ${role.toUpperCase()}`
      );
      setAuditLogs(prev => [newLog, ...prev]);
    } catch (err) {
      console.warn('Role update error:', err);
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
      await deleteUserFromFirestore(userId);
      const newLog = await logAdminAction(
        'USER_DELETED',
        targetUser.email,
        currentUser.email,
        `User account removed permanently from cloud database`
      );
      setAuditLogs(prev => [newLog, ...prev]);
    } catch (err) {
      console.warn('Delete user error:', err);
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
