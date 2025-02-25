import { create } from "zustand";

interface ApiState {
  remainingCalls: number;
  setRemainingCalls: (calls: number) => void;
  decrementCalls: () => void;
}

export const useApiStore = create<ApiState>((set) => ({
  remainingCalls: 5,
  setRemainingCalls: (calls) => set({ remainingCalls: calls }),
  decrementCalls: () =>
    set((state) => ({ remainingCalls: Math.max(0, state.remainingCalls - 1) })),
}));
