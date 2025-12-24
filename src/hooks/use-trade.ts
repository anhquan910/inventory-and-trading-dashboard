import { api } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSubmitTransaction = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/transactions/", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Transaction recorded successfully");
    },
  });
};