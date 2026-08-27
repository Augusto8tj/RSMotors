import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Tenant, UserProfile, UserRole } from '../types';
import { INITIAL_TENANTS, INITIAL_USERS } from '../data/mockInitialData';

interface AuthTenantContextType {
  tenant: Tenant;
  user: UserProfile;
  tenants: Tenant[];
  users: UserProfile[];
  setTenantId: (tenantId: string) => void;
  setUserRole: (role: UserRole) => void;
  setUserUid: (uid: string) => void;
  isTrial: boolean;
  trialDaysRemaining: number;
  isReadOnlyMode: boolean; // True when trial has expired and plan is not active
  consumePlateCredit: () => boolean;
  toggleSimulateExpiredTrial: () => void;
  isPaywallModalOpen: boolean;
  openPaywallModal: () => void;
  closePaywallModal: () => void;
  upgradePlan: (plan: 'pro' | 'enterprise') => void;
  resetTenantCredits: () => void;
}

const AuthTenantContext = createContext<AuthTenantContextType | undefined>(undefined);

const TENANT_STORAGE_KEY = 'rsmotors_tenants_v2';
const USER_STORAGE_KEY = 'rsmotors_current_user_v2';

export const AuthTenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    try {
      const stored = localStorage.getItem(TENANT_STORAGE_KEY) || localStorage.getItem('autofleet_tenants_v1');
      if (stored) {
        const parsed: Tenant[] = JSON.parse(stored);
        // Ensure tenant name is updated to RSmotors
        return parsed.map((t) =>
          t.id === 'tenant-autoprime-01' ? { ...t, name: 'RSmotors - Soluções Veiculares' } : t
        );
      }
      return INITIAL_TENANTS;
    } catch {
      return INITIAL_TENANTS;
    }
  });

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    return tenants[0]?.id || INITIAL_TENANTS[0].id;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem('autofleet_current_user_v1');
      if (stored) {
        const parsed: UserProfile = JSON.parse(stored);
        if (parsed.uid === 'user-admin-01' || parsed.role === 'Admin') {
          return INITIAL_USERS[0];
        }
        return parsed;
      }
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [isPaywallModalOpen, setIsPaywallModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(tenants));
    } catch (e) {
      console.error(e);
    }
  }, [tenants]);

  useEffect(() => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  const activeTenant = useMemo(() => {
    return tenants.find((t) => t.id === activeTenantId) || tenants[0] || INITIAL_TENANTS[0];
  }, [tenants, activeTenantId]);

  // Trial calculations
  const trialDaysRemaining = useMemo(() => {
    if (activeTenant.plan !== 'trial' && activeTenant.status === 'active') return 999;
    const now = Date.now();
    const end = new Date(activeTenant.trialEndDate).getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [activeTenant]);

  const isTrial = activeTenant.plan === 'trial' || activeTenant.status === 'trial';
  
  // Read-only lock when trial has expired
  const isReadOnlyMode = activeTenant.status === 'expired' || (isTrial && trialDaysRemaining <= 0);

  const setTenantId = (tenantId: string) => {
    const found = tenants.find((t) => t.id === tenantId);
    if (found) {
      setActiveTenantId(tenantId);
      // Update user's tenant binding
      setCurrentUser((prev) => ({ ...prev, tenantId }));
    }
  };

  const setUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  const setUserUid = (uid: string) => {
    const found = INITIAL_USERS.find((u) => u.uid === uid);
    if (found) {
      setCurrentUser({ ...found, tenantId: activeTenantId });
    }
  };

  const consumePlateCredit = (): boolean => {
    if (activeTenant.plateQueriesUsed >= activeTenant.plateQueriesLimit) {
      return false;
    }
    setTenants((prev) =>
      prev.map((t) =>
        t.id === activeTenant.id
          ? { ...t, plateQueriesUsed: t.plateQueriesUsed + 1 }
          : t
      )
    );
    return true;
  };

  const toggleSimulateExpiredTrial = () => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === activeTenant.id) {
          const isNowExpired = t.status === 'expired';
          return {
            ...t,
            status: isNowExpired ? 'trial' : 'expired',
            trialEndDate: isNowExpired
              ? new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          };
        }
        return t;
      })
    );
  };

  const upgradePlan = (plan: 'pro' | 'enterprise') => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === activeTenant.id
          ? {
              ...t,
              plan,
              status: 'active',
              plateQueriesLimit: plan === 'enterprise' ? 500 : 150,
            }
          : t
      )
    );
    setIsPaywallModalOpen(false);
  };

  const resetTenantCredits = () => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === activeTenant.id ? { ...t, plateQueriesUsed: 0 } : t
      )
    );
  };

  return (
    <AuthTenantContext.Provider
      value={{
        tenant: activeTenant,
        user: currentUser,
        tenants,
        users: INITIAL_USERS,
        setTenantId,
        setUserRole,
        setUserUid,
        isTrial,
        trialDaysRemaining,
        isReadOnlyMode,
        consumePlateCredit,
        toggleSimulateExpiredTrial,
        isPaywallModalOpen,
        openPaywallModal: () => setIsPaywallModalOpen(true),
        closePaywallModal: () => setIsPaywallModalOpen(false),
        upgradePlan,
        resetTenantCredits,
      }}
    >
      {children}
    </AuthTenantContext.Provider>
  );
};

export const useAuthTenant = () => {
  const context = useContext(AuthTenantContext);
  if (!context) {
    throw new Error('useAuthTenant must be used within an AuthTenantProvider');
  }
  return context;
};
