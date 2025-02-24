import { useState, useEffect } from "@/lib/react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";
import type {
  Portfolio,
  CreatePortfolioData,
  UpdatePortfolioData,
} from "@/types/portfolio";

export function usePortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchPortfolios();
    }
  }, [user]);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async (data: CreatePortfolioData) => {
    try {
      const { error } = await supabase.from("portfolios").insert([
        {
          ...data,
          user_id: user?.id,
        },
      ]);

      if (error) throw error;
      await fetchPortfolios();
    } catch (error) {
      console.error("Error creating portfolio:", error);
      throw error;
    }
  };

  const updatePortfolio = async (id: string, data: UpdatePortfolioData) => {
    try {
      const { error } = await supabase
        .from("portfolios")
        .update(data)
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
      await fetchPortfolios();
    } catch (error) {
      console.error("Error updating portfolio:", error);
      throw error;
    }
  };

  const deletePortfolio = async (id: string) => {
    try {
      const { error } = await supabase
        .from("portfolios")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
      await fetchPortfolios();
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      throw error;
    }
  };

  return {
    portfolios,
    loading,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
  };
}
