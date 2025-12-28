import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useFinancials = (period: string) => {
  return useQuery({
    queryKey: ["financials", period],
    queryFn: async () => {
      const res = await api.get(`/analytics/financials?period=${period}`);
      return res.data;
    },
  });
};