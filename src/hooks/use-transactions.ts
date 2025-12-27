import { api } from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Transaction {
  id: number;
  created_at: string;
  customer_name: string;
  transaction_type: "RETAIL" | "TRADE";
  total_amount: number;
  balance_due: number;
  status: "COMPLETED" | "PENDING";
}

export const useTransactions = (statusFilter?: string) => {
  return useQuery({
    queryKey: ["transactions", statusFilter],
    queryFn: async () => {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await api.get<Transaction[]>("/transactions/", { params });
      return res.data;
    },
  });
};

export const useMarkPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/transactions/${id}/pay`);
    },
    onSuccess: () => {
      toast.success("Debt cleared!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};