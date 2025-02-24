import { create } from "zustand";

interface NavigationState {
  isNavigating: boolean;
}

interface NavigationActions {
  setIsNavigating: (value: boolean) => void;
}

export const useNavigationStore = create<NavigationState & NavigationActions>()(
  (set) => ({
    isNavigating: false,
    setIsNavigating: (value) => set({ isNavigating: value }),
  }),
);
