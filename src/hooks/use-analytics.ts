import { api } from "@/lib/axios"; // Axios instance for API calls
import { useQuery } from "@tanstack/react-query"; // React Query hook for data fetching

export const useFinancials = (period: string) => {
  return useQuery({
    queryKey: ["financials", period],
    queryFn: async () => {
      const res = await api.get(`/analytics/financials?period=${period}`);
      return res.data;
    },
  });
}; // Hook to fetch financial analytics data for a given reporting period