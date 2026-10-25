'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'coordinator' | 'courier' | 'inventory_officer' | 'auditor';

export interface UserPermissions {
  canApproveTransfers: boolean;
  canRejectTransfers: boolean;
  canTriggerTriage: boolean;
  canManageInventory: boolean;
  canLogFieldTelemetry: boolean;
  canViewAnalytics: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  facilityId: string;
  facilityName: string;
  avatarInitials: string;
  badgeColor: 'rose' | 'amber' | 'emerald' | 'sky';
  driverId?: string;
  badgeLabel: string;
  permissions: UserPermissions;
}

export const DEMO_USERS: Record<UserRole, AuthUser> = {
  coordinator: {
    id: 'USR-COORD-01',
    name: 'Dr. Aishwarya Raman',
    email: 'aishwarya.raman@vitalis.health',
    role: 'coordinator',
    roleTitle: 'Chief Clinical Logistics Officer',
    facilityId: 'c71a399f-07da-4e4b-91c2-559d81373516',
    facilityName: 'Apollo Hospitals, Greams Rd (Apex Command)',
    avatarInitials: 'AR',
    badgeColor: 'rose',
    badgeLabel: 'Physician / Dispatch Admin',
    permissions: {
      canApproveTransfers: true,
      canRejectTransfers: true,
      canTriggerTriage: true,
      canManageInventory: true,
      canLogFieldTelemetry: false,
      canViewAnalytics: true,
    },
  },
  courier: {
    id: 'USR-COUR-02',
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@vitalis.health',
    role: 'courier',
    roleTitle: 'ALS Rapid Response Paramedic',
    facilityId: '993a2164-3e9a-4131-b840-798889da3b2b',
    facilityName: 'Regional Blood Transfusion Center',
    avatarInitials: 'VR',
    badgeColor: 'amber',
    badgeLabel: 'Field Courier (ALS Unit #104)',
    driverId: 'VTL-DRV-784',
    permissions: {
      canApproveTransfers: false,
      canRejectTransfers: false,
      canTriggerTriage: false,
      canManageInventory: false,
      canLogFieldTelemetry: true,
      canViewAnalytics: false,
    },
  },
  inventory_officer: {
    id: 'USR-INV-03',
    name: 'Dr. K. Sundaramoorthy',
    email: 'k.sundar@vitalis.health',
    role: 'inventory_officer',
    roleTitle: 'Regional Blood Bank Director',
    facilityId: '993a2164-3e9a-4131-b840-798889da3b2b',
    facilityName: 'Regional Blood Transfusion Center, Egmore',
    avatarInitials: 'KS',
    badgeColor: 'emerald',
    badgeLabel: 'Blood Bank Custodian',
    permissions: {
      canApproveTransfers: false,
      canRejectTransfers: false,
      canTriggerTriage: true,
      canManageInventory: true,
      canLogFieldTelemetry: false,
      canViewAnalytics: true,
    },
  },
  auditor: {
    id: 'USR-AUD-04',
    name: 'Director Santhosh Kumar',
    email: 'santhosh.kumar@tnhealth.gov.in',
    role: 'auditor',
    roleTitle: 'Healthcare Compliance Auditor',
    facilityId: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
    facilityName: 'Tamil Nadu Medical Council & Directorate',
    avatarInitials: 'SK',
    badgeColor: 'sky',
    badgeLabel: 'Read-Only Compliance Auditor',
    permissions: {
      canApproveTransfers: false,
      canRejectTransfers: false,
      canTriggerTriage: false,
      canManageInventory: false,
      canLogFieldTelemetry: false,
      canViewAnalytics: true,
    },
  },
};

export interface CredentialEntry {
  username: string;
  aliases: string[];
  role: UserRole;
  password: string;
  user: AuthUser;
}

export const USER_CREDENTIALS: CredentialEntry[] = [
  {
    username: 'coordinator',
    aliases: ['aishwarya', 'admin', 'aishwarya.raman@vitalis.health'],
    role: 'coordinator',
    password: 'vitalis123',
    user: DEMO_USERS.coordinator,
  },
  {
    username: 'courier',
    aliases: ['vikram', 'driver', 'vikram.rao@vitalis.health'],
    role: 'courier',
    password: 'vitalis123',
    user: DEMO_USERS.courier,
  },
  {
    username: 'inventory',
    aliases: ['sundar', 'bloodbank', 'k.sundar@vitalis.health'],
    role: 'inventory_officer',
    password: 'vitalis123',
    user: DEMO_USERS.inventory_officer,
  },
  {
    username: 'auditor',
    aliases: ['santhosh', 'compliance', 'santhosh.kumar@tnhealth.gov.in'],
    role: 'auditor',
    password: 'vitalis123',
    user: DEMO_USERS.auditor,
  },
];

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginAs: (role: UserRole) => void;
  loginWithCredentials: (identifier: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vitalis-auth-role') as UserRole | null;
      if (saved && DEMO_USERS[saved]) {
        return DEMO_USERS[saved];
      }
    }
    return DEMO_USERS.coordinator;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('vitalis-auth-role', user.role);
    } else {
      localStorage.removeItem('vitalis-auth-role');
    }
  }, [user]);

  const loginAs = (role: UserRole) => {
    if (DEMO_USERS[role]) {
      setUser(DEMO_USERS[role]);
      setIsAuthModalOpen(false);
    }
  };

  const loginWithCredentials = (
    identifier: string,
    pass: string
  ): { success: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanId) {
      return { success: false, error: 'Please enter your username or clinical email.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Please enter your password.' };
    }

    // Find account by username, role, email, or alias
    const matched = USER_CREDENTIALS.find(
      (c) =>
        c.username.toLowerCase() === cleanId ||
        c.role.toLowerCase() === cleanId ||
        c.user.email.toLowerCase() === cleanId ||
        c.aliases.some((a) => a.toLowerCase() === cleanId)
    );

    if (!matched) {
      return {
        success: false,
        error: `Account '${identifier}' not recognized. Try 'coordinator', 'courier', 'inventory', or 'auditor'.`,
      };
    }

    // Accept valid passwords (e.g., 'vitalis123', 'password123', or matching role)
    if (
      cleanPass !== matched.password &&
      cleanPass !== 'password123' &&
      cleanPass !== 'vitalis' &&
      cleanPass !== matched.username
    ) {
      return {
        success: false,
        error: 'Incorrect password. Default demo password is: vitalis123',
      };
    }

    setUser(matched.user);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    loginAs(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginAs,
        loginWithCredentials,
        logout,
        switchRole,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
