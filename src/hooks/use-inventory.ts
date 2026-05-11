import { api } from "@/lib/axios"; // Axios instance for API calls
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // React Query hooks for data fetching and mutations
import { toast } from "sonner"; // Toast notification library

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
} // Material inventory item interface with stock and cost information

export interface CreateMaterialDTO {
  name: string;
  sku?: string;
  category: string;
  current_stock: number;
  unit_of_measure: string;
  cost_per_unit: number;
  reorder_level: number;
} // Data transfer object for creating new material entries

export interface UpdateMaterialDTO extends Partial<CreateMaterialDTO> {
  id: number;
} // Data transfer object for updating existing materials with required ID

export const useMaterials = () => {
  return useQuery({
    queryKey: ["materials"],
    queryFn: async () => {
      const res = await api.get<Material[]>("/inventory/");
      return res.data;
    },
  });
}; // Hook to fetch all materials from the inventory

export const useCreateMaterial = () => {
  const queryClient = useQueryClient(); // Get query client for cache invalidation

  return useMutation({
    mutationFn: async (data: CreateMaterialDTO) => {
      const res = await api.post("/inventory/", data);
      return res.data;
    }, // API call to create a new material
    onSuccess: () => {
      toast.success("Material added successfully");
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    }, // Refresh material list and show success toast on successful creation
  });
}; // Hook for adding new materials to the inventory

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient(); // Get query client for cache invalidation

  return useMutation({
    mutationFn: async (data: UpdateMaterialDTO) => {
      const { id, ...body } = data;
      const res = await api.patch(`/inventory/${id}`, body);
      return res.data;
    }, // API call to update an existing material by ID
    onSuccess: () => {
      toast.success("Material updated successfully");
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    }, // Refresh material list and show success toast on successful update
  });
}; // Hook for updating existing material properties

export interface AuditItem {
  material_id: number;
  counted_quantity: number;
} // Item interface for stocktake audit submissions

export const useSubmitAudit = () => {
  const queryClient = useQueryClient(); // Get query client for cache invalidation
  return useMutation({
    mutationFn: async (items: AuditItem[]) => {
      await api.post("/inventory/audit", { items });
    }, // API call to submit stocktake audit results
    onSuccess: () => {
      toast.success("Stock levels updated");
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    }, // Refresh material list and show success message after audit submission
  });
}; // Hook for submitting inventory audit counts to update stock levels
