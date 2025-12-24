import { api } from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  description?: string;
  retail_price: number;
  manufacture_cost: number;
  stock_quantity: number;
  image_url?: string;
}

export interface CreateProductDTO {
  sku: string;
  name: string;
  category: string;
  retail_price: number;
  manufacture_cost: number;
  stock_quantity: number;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get<Product[]>("/products/");
      return res.data;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProductDTO) => {
      const res = await api.post("/products/", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};