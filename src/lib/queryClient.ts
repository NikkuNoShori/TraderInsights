import { QueryClient } from "@tanstack/react-query";

console.log("Creating QueryClient");

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

console.log("QueryClient created");
