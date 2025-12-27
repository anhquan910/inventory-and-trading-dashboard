import { api } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useMarketTrend = () => {
  return useQuery({
    queryKey: ["market-trend"],
    queryFn: async () => {
      const res = await api.get("/market/trend");
      return res.data;
    }
  });
};