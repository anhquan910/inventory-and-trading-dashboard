import { useState } from "react";
import { useMaterials } from "@/hooks/use-inventory";
import {
  useRecipe,
  useAddComponent,
  useDeleteComponent,
} from "@/hooks/use-recipes";
import { type Product } from "@/hooks/use-product";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecipeDialog({ product, open, onOpenChange }: Props) {
  const { data: materials } = useMaterials();
  const { data: components } = useRecipe(product?.id || null);
  const { mutateAsync: addComponent } = useAddComponent();
  const { mutateAsync: removeComponent } = useDeleteComponent();

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);

  if (!product) return null;

  const handleAdd = async () => {
    if (!selectedMaterialId || quantity <= 0) return;
    await addComponent({
      productId: product.id,
      materialId: parseInt(selectedMaterialId),
      quantity: quantity,
    });
    setQuantity(0);
  };

  const totalRecipeCost =
    components?.reduce(
      (sum, item) => sum + item.cost_at_time_of_calculation,
      0
    ) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Recipe Builder: {product.name}</DialogTitle>
          <DialogDescription>
            Define what materials are used to make this item.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-end gap-3 p-4 border rounded-lg bg-muted/50">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Material</label>
              <Select
                onValueChange={setSelectedMaterialId}
                value={selectedMaterialId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material..." />
                </SelectTrigger>
                <SelectContent>
                  {materials?.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.name} (${m.cost_per_unit}/{m.unit_of_measure})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-24 space-y-2">
              <label className="text-sm font-medium">Qty</label>
              <Input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
              />
            </div>

            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>

          {/* --- PART 2: COMPONENT LIST (BOM) --- */}
          <div>
            <h4 className="mb-2 text-sm font-semibold">Bill of Materials</h4>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Cost Impact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {components?.map((comp) => (
                    <TableRow key={comp.id}>
                      <TableCell>{comp.material_name}</TableCell>
                      <TableCell>{comp.quantity_used}</TableCell>
                      <TableCell className="text-right">
                        ${comp.cost_at_time_of_calculation.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/90"
                          onClick={() =>
                            removeComponent({
                              productId: product.id,
                              componentId: comp.id,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!components || components.length === 0) && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        No components added yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* --- TOTAL FOOTER --- */}
            <div className="flex justify-between items-center mt-4 p-4 bg-blue-50 text-blue-900 rounded-lg">
              <div className="font-semibold">Total Manufacturing Cost:</div>
              <div className="text-xl font-bold">
                ${totalRecipeCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
