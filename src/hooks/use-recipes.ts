import { api } from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface RecipeComponent {
  id: number;
  material_name: string;
  quantity_used: number;
  cost_at_time_of_calculation: number;
}

export const useRecipe = (productId: number | null) => {
  return useQuery({
    queryKey: ["recipe", productId],
    queryFn: async () => {
      if (!productId) return [];
      const res = await api.get<RecipeComponent[]>(`/products/${productId}/components`);
      return res.data;
    },
    enabled: !!productId,
  });
};

export const useAddComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, materialId, quantity }: { productId: number, materialId: number, quantity: number }) => {
      await api.post(`/products/${productId}/components`, {
        material_id: materialId,
        quantity: quantity
      });
    },
    onSuccess: (_, variables) => {
      toast.success("Component added");
      queryClient.invalidateQueries({ queryKey: ["recipe", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteComponent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, componentId }: { productId: number, componentId: number }) => {
      await api.delete(`/products/${productId}/components/${componentId}`);
    },
    onSuccess: (_, variables) => {
      toast.success("Component removed");
      queryClient.invalidateQueries({ queryKey: ["recipe", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};