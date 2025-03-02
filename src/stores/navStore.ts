import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NavState {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

export const useNavStore = create<NavState>()(
  persist(
    (set) => ({
      isCollapsed: true, // Default to collapsed state
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      toggleCollapsed: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: "nav-state",
    }
  )
);
