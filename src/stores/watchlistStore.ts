import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import type { StockQuote, WatchlistSymbol } from "@/types/stock";
import { fetchStockQuote } from "@/services/alphaVantage";
import { withRetry } from "@/utils/withRetry";
import { isFeatureAccessible } from "@/utils/marketHours";

interface WatchlistState {
  symbols: string[];
  quotes: StockQuote[];
  watchlistData: WatchlistSymbol[];
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  addSymbol: (symbol: string, userId: string) => Promise<void>;
  removeSymbol: (symbol: string, userId: string) => Promise<void>;
  refreshQuotes: (force?: boolean) => Promise<void>;
  initializeWatchlist: (userId: string) => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: [],
      quotes: [],
      watchlistData: [],
      isLoading: false,
      error: null,
      initialized: false,

      initializeWatchlist: async (userId: string) => {
        // Prevent recursive initialization
        if (get().initialized) {
          console.log("Watchlist already initialized, skipping");
          return;
        }

        set({ isLoading: true, error: null });
        try {
          if (!userId || typeof userId !== "string" || userId.length < 32) {
            throw new Error("Invalid user ID");
          }

          console.log("Initializing watchlist for user:", userId);
          const { data: watchlistSymbols, error } = await supabase
            .from("symbols_watched")
            .select("*")
            .eq("user_id", userId);

          if (error) {
            console.error("Supabase error initializing watchlist:", error);
            throw error;
          }

          console.log("Fetched watchlist symbols:", watchlistSymbols);
          const symbols = (watchlistSymbols || []).map((ws) => ws.symbol);
          set({
            symbols,
            watchlistData: watchlistSymbols as WatchlistSymbol[],
            initialized: true,
          });

          if (symbols.length > 0) {
            console.log("Refreshing quotes for symbols:", symbols);
            await get().refreshQuotes();
          }
        } catch (error) {
          console.error("Failed to initialize watchlist:", {
            error,
            userId,
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          });
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to load watchlist",
            initialized: true, // Set initialized even on error to prevent infinite loading
          });
        } finally {
          set({ isLoading: false });
        }
      },

      addSymbol: async (symbol: string, userId?: string) => {
        const { symbols } = get();
        const normalizedSymbol = symbol.toUpperCase().trim();

        if (!userId || typeof userId !== "string" || userId.length < 32) {
          console.error("Invalid user ID provided:", userId);
          set({ error: "Authentication error - please try logging in again" });
          return;
        }

        console.log("Adding symbol to watchlist:", {
          symbol: normalizedSymbol,
          userId,
        });

        if (symbols.includes(normalizedSymbol)) {
          console.warn("Symbol already exists in watchlist:", normalizedSymbol);
          set({ error: `${normalizedSymbol} is already in your watchlist` });
          return;
        }

        if (!userId) {
          console.error("Attempted to add symbol without user ID");
          set({ error: "Please log in to add symbols to your watchlist" });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          console.log("Inserting symbol into database:", normalizedSymbol);
          const { error: dbError } = await supabase
            .from("symbols_watched")
            .insert({
              symbol: normalizedSymbol,
              user_id: userId,
            });

          if (dbError) {
            console.error("Supabase error adding symbol:", {
              error: dbError,
              symbol: normalizedSymbol,
              userId,
            });
            throw dbError;
          }

          console.log("Fetching quote for new symbol:", normalizedSymbol);
          const quote = await withRetry(
            () => fetchStockQuote(normalizedSymbol),
            {
              retries: 3,
              delay: 1000,
              onError: (error) => {
                console.error("Failed to fetch quote:", {
                  symbol: normalizedSymbol,
                  error,
                  attempt: "retry",
                });
              },
            }
          );

          console.log("Successfully fetched quote:", {
            symbol: normalizedSymbol,
            quote,
          });
          set((state) => ({
            symbols: [...state.symbols, normalizedSymbol],
            quotes: [...state.quotes, quote],
            error: null,
          }));
        } catch (error) {
          console.error("Failed to add symbol:", {
            error,
            symbol: normalizedSymbol,
            userId,
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
            errorStack: error instanceof Error ? error.stack : undefined,
          });
          set({
            error:
              error instanceof Error
                ? error.message
                : `Failed to add ${normalizedSymbol} to watchlist`,
          });
          throw error; // Propagate error to UI
        } finally {
          set({ isLoading: false });
        }
      },

      removeSymbol: async (symbol: string, userId?: string) => {
        if (!userId || typeof userId !== "string" || userId.length < 32) {
          console.error("Invalid user ID provided:", userId);
          set({ error: "Authentication error - please try logging in again" });
          return;
        }

        if (!userId) {
          console.error("Attempted to remove symbol without user ID");
          set({ error: "Please log in to remove symbols from your watchlist" });
          return;
        }

        console.log("Removing symbol from watchlist:", { symbol, userId });
        try {
          const { error: dbError } = await supabase
            .from("symbols_watched")
            .delete()
            .eq("symbol", symbol)
            .eq("user_id", userId);

          if (dbError) {
            console.error("Supabase error removing symbol:", {
              error: dbError,
              symbol,
              userId,
            });
            throw dbError;
          }

          console.log("Successfully removed symbol:", symbol);
          set((state) => ({
            symbols: state.symbols.filter((s) => s !== symbol),
            quotes: state.quotes.filter((q) => q.symbol !== symbol),
            error: null,
          }));
        } catch (error) {
          console.error("Failed to remove symbol:", {
            error,
            symbol,
            userId,
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
            errorStack: error instanceof Error ? error.stack : undefined,
          });
          set({
            error:
              error instanceof Error
                ? error.message
                : `Failed to remove ${symbol} from watchlist`,
          });
          throw error; // Propagate error to UI
        }
      },

      refreshQuotes: async (force = false) => {
        const { symbols } = get();
        if (symbols.length === 0) return;

        // Skip refresh if market is closed and not forced
        if (!force && !isFeatureAccessible("quotes")) {
          console.log("Market is closed, skipping quote refresh");
          return;
        }

        console.log("Refreshing quotes for symbols:", symbols);

        set({ isLoading: true, error: null });
        try {
          const quotesPromises = symbols.map(
            (symbol) =>
              withRetry(() => fetchStockQuote(symbol), {
                retries: 3,
                delay: 1000,
                onError: (error) => {
                  console.error("Failed to refresh quote:", {
                    symbol,
                    error,
                    attempt: "retry",
                  });
                },
              }).catch(() => null) // Convert individual failures to null
          );

          const quotes = await Promise.all(quotesPromises);
          const validQuotes = quotes.filter((q): q is StockQuote => q !== null);

          console.log("Quote refresh results:", {
            totalSymbols: symbols.length,
            successfulQuotes: validQuotes.length,
            failedQuotes: symbols.length - validQuotes.length,
          });
          if (validQuotes.length === 0 && symbols.length > 0) {
            console.error("Failed to fetch any valid quotes");
            throw new Error("Failed to fetch any stock quotes");
          }

          set({
            quotes: validQuotes,
            error:
              validQuotes.length < symbols.length
                ? "Some quotes failed to update"
                : null,
          });
        } catch (error) {
          console.error("Failed to refresh quotes:", {
            error,
            symbols,
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
            errorStack: error instanceof Error ? error.stack : undefined,
          });
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to refresh quotes",
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "watchlist-storage",
      partialize: (state) => ({
        symbols: state.symbols,
      }),
    }
  )
);
