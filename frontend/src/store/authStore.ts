import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Tenant } from '../types';

interface AuthStore {
  user: User | null;
  tenant: Tenant | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (user: User, accessToken: string, refreshToken?: string, tenant?: Tenant) => void;
  logout: () => void;
  setTenant: (tenant: Tenant) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,
      login: (user, accessToken, refreshToken, tenant) =>
        set({ user, accessToken, refreshToken, tenant, isAuthenticated: true }),
      logout: () =>
        set({ user: null, tenant: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      setTenant: (tenant) => set({ tenant }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'imtech-auth-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        console.log('[AuthStore] 🔄 Début de la réhydratation...');
        return (state, error) => {
          if (error) {
            console.error('[AuthStore] ❌ Erreur de réhydratation:', error);
            // Même en cas d'erreur, on marque comme hydraté pour ne pas bloquer l'app
            useAuthStore.getState().setHydrated();
          } else if (state) {
            state.isHydrated = true;
            console.log('[AuthStore] ✅ Réhydratation terminée avec succès', {
              isAuthenticated: state.isAuthenticated,
              hasUser: !!state.user,
              hasTenant: !!state.tenant,
              tenantId: state.tenant?.id || state.user?.tenantId,
            });
          } else {
            // Pas de state = localStorage vide, on marque quand même comme hydraté
            console.log('[AuthStore] ℹ️ Pas de données à réhydrater (localStorage vide)');
            useAuthStore.getState().setHydrated();
          }
        };
      },
    }
  )
);

// S'assurer que isHydrated est mis à true après un court délai si la réhydratation ne se déclenche pas
setTimeout(() => {
  const state = useAuthStore.getState();
  if (!state.isHydrated) {
    console.warn('[AuthStore] ⚠️ Forçage de isHydrated après timeout');
    state.setHydrated();
  }
}, 100);
