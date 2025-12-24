import { useState } from "react";
import { useRecipe } from "@/hooks/use-recipes";
import { useProduceItem } from "@/hooks/use-products";
import { type Product } from "@/hooks/use-products";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hammer } from "lucide-react";

interface Props {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProduceDialog({ product, open, onOpenChange }: Props) {
  const [quantity, setQuantity] = useState(1);
  const { data: recipe } = useRecipe(product?.id || null);
  const { mutateAsync, isPending } = useProduceItem();

  if (!product) return null;

  const handleProduce = async () => {
    try {
      await mutateAsync({ productId: product.id, quantity });
      onOpenChange(false);
      setQuantity(1);
    } catch (e) {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Production</DialogTitle>
          <DialogDescription>
            Register new stock for <strong>{product.name}</strong>. This will
            deduct materials from your inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="qty" className="text-right">
              Quantity
            </Label>
            <Input
              id="qty"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="col-span-3"
              min={1}
            />
          </div>

          {/* --- Material Impact Summary --- */}
          <div className="bg-muted/50 p-3 rounded-md text-sm space-y-2 mt-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Hammer className="w-3 h-3" /> Materials to Consume:
            </h4>
            {recipe && recipe.length > 0 ? (
              <ul className="space-y-1 text-muted-foreground">
                {recipe.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.material_name}</span>
                    <span className="font-mono">
                      {(item.quantity_used * quantity).toFixed(2)} used
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-yellow-600">
                Warning: No recipe defined. No materials will be deducted.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleProduce} disabled={isPending || quantity < 1}>
            {isPending ? "Processing..." : "Confirm Production"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
