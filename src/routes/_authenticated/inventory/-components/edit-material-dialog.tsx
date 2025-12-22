import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useUpdateMaterial, type Material } from "@/hooks/use-inventory";

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

const updateSchema = z.object({
  current_stock: z.number().min(0),
  cost_per_unit: z.number().min(0),
  reorder_level: z.number().min(0),
  name: z.string().min(1),
});

interface Props {
  material: Material;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMaterialDialog({ material, open, onOpenChange }: Props) {
  if (!material) return null;

  const { mutateAsync, isPending } = useUpdateMaterial();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Material</DialogTitle>
          <DialogDescription>
            Update stock levels or price for {material.sku}.
          </DialogDescription>
        </DialogHeader>

        <EditForm
          key={material.id}
          material={material}
          onSubmit={async (vals) => {
            await mutateAsync({ id: material.id, ...vals });
            onOpenChange(false);
          }}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  material,
  onSubmit,
  isPending,
}: {
  material: Material;
  onSubmit: (vals: any) => Promise<void>;
  isPending: boolean;
}) {
  const form = useForm({
    defaultValues: {
      name: material.name,
      current_stock: material.current_stock,
      cost_per_unit: material.cost_per_unit,
      reorder_level: material.reorder_level,
    },
    validators: {
      onChange: updateSchema,
    },
    onSubmit: async ({ value }) => onSubmit(value),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      {/* Stock Level (Primary Use Case) */}
      <form.Field
        name="current_stock"
        children={(field) => (
          <div className="space-y-2">
            <Label className="text-blue-600 font-bold">
              Current Stock Level
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                className="text-lg font-mono"
                value={field.state.value}
                onChange={(e) => field.handleChange(parseFloat(e.target.value))}
              />
              <span className="text-sm text-muted-foreground">
                {material.unit_of_measure}
              </span>
            </div>
          </div>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="cost_per_unit"
          children={(field) => (
            <div className="space-y-2">
              <Label>Cost / Unit</Label>
              <Input
                type="number"
                step="0.01"
                value={field.state.value}
                onChange={(e) => field.handleChange(parseFloat(e.target.value))}
              />
            </div>
          )}
        />
        <form.Field
          name="reorder_level"
          children={(field) => (
            <div className="space-y-2">
              <Label>Reorder Alert Level</Label>
              <Input
                type="number"
                step="0.01"
                value={field.state.value}
                onChange={(e) => field.handleChange(parseFloat(e.target.value))}
              />
            </div>
          )}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Update"}
        </Button>
      </DialogFooter>
    </form>
  );
}
