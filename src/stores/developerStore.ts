import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DeveloperState {
  isDeveloperMode: boolean;
  setDeveloperMode: (enabled: boolean) => void;
}

export const useDeveloperStore = create<DeveloperState>()(
  persist(
    (set) => ({
      isDeveloperMode: false,
      setDeveloperMode: (enabled) => set({ isDeveloperMode: enabled }),
    }),
    {
      name: "developer-storage",
    },
  ),
);
