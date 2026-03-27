import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Score {
  id: string; score: number; played_date: string; position: number;
}
interface Subscription {
  id: string; status: string; interval: string; currentPeriodEnd: string; amountCents: number;
}

interface AppState {
  userId: string | null;
  userRole: 'user' | 'admin' | null;
  subscription: Subscription | null;
  isSubscribed: boolean;
  scores: Score[];
  scoresComplete: boolean;
  sidebarOpen: boolean;
  setUser: (userId: string, role: 'user' | 'admin') => void;
  clearUser: () => void;
  setSubscription: (sub: Subscription | null) => void;
  setScores: (scores: Score[]) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userId: null,
      userRole: null,
      subscription: null,
      isSubscribed: false,
      scores: [],
      scoresComplete: false,
      sidebarOpen: true,
      setUser: (userId, role) => set({ userId, userRole: role }),
      clearUser: () => set({ userId: null, userRole: null, subscription: null, isSubscribed: false, scores: [], scoresComplete: false }),
      setSubscription: (sub) => set({ subscription: sub, isSubscribed: sub !== null && ['active', 'trialing'].includes(sub.status) }),
      setScores: (scores) => set({ scores, scoresComplete: scores.length === 5 }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    { name: 'birdiepool-store', partialize: (state) => ({ sidebarOpen: state.sidebarOpen }) }
  )
);
