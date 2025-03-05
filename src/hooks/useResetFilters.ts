import { useEffect } from "@/lib/react";
import { useLocation } from "react-router-dom";
import { useFilterStore } from "@/stores/filterStore";

export function useResetFilters() {
  const location = useLocation();
  const { clearFilters } = useFilterStore();

  useEffect(() => {
    clearFilters();
  }, [location.pathname]);
}
