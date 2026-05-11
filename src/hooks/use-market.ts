import { api } from "@/lib/axios"; // Axios instance for API calls
import { useQuery } from "@tanstack/react-query"; // React Query hook for data fetching

export const useMarketTrend = () => {
  return useQuery({
    queryKey: ["market-trend"],
    queryFn: async () => {
      const res = await api.get("/market/trend");
      return res.data;
    }
  });
}; // Hook to fetch current market trend data for gold pricing
