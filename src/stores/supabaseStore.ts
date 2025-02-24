import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

interface SupabaseState {
  client: SupabaseClient;
}

export const useSupabaseStore = create<SupabaseState>(() => ({
  client: supabase,
}));
