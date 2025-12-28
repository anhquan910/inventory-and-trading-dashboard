import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Material {
  id: number;
  name: string;
  sku: string | null;
  category: string;
  current_stock: number;
  unit_of_measure: string;
  cost_per_unit: number;
  reorder_level: number;
  last_updated: string;
}

export interface CreateMaterialDTO {
  name: string;
  sku?: string;
  category: string;
  current_stock: number;
  unit_of_measure: string;
  cost_per_unit: number;
  reorder_level: number;
}

export interface UpdateMaterialDTO extends Partial<CreateMaterialDTO> {
  id: number;
}

export const useMaterials = () => {
  return useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const res = await api.get<Material[]>("/inventory/");
      return res.data;
    },
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMaterialDTO) => {
      const res = await api.post("/inventory/", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Material added successfully");
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMaterialDTO) => {
      const { id, ...body } = data;
      const res = await api.patch(`/inventory/${id}`, body);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Material updated successfully");
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
};

export interface AuditItem {
  material_id: number;
  counted_quantity: number;
}

export const useSubmitAudit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: AuditItem[]) => {
      await api.post("/inventory/audit", { items });
    },
    onSuccess: () => {
      toast.success("Stock levels updated");
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
};