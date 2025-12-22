import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useCreateMaterial } from "@/hooks/use-inventory";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";

const materialSchema = z.object({
  name: z.string().min(2, "Name is required"),
  sku: z.string(),
  category: z.string().min(1, "Category is required"),
  unit_of_measure: z.string(),
  current_stock: z.number().min(0),
  cost_per_unit: z.number().min(0),
  reorder_level: z.number().min(0),
});

export function AddMaterialDialog() {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useCreateMaterial();

  const form = useForm({
    defaultValues: {
      name: "",
      sku: "",
      category: "Metal",
      unit_of_measure: "grams",
      current_stock: 0,
      cost_per_unit: 0,
      reorder_level: 10,
    },
    validators: {
      onChange: materialSchema,
    },
    onSubmit: async ({ value }) => {
      await mutateAsync({
        ...value,
        sku: value.sku || undefined,
      });
      setOpen(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Material
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
          <DialogDescription>
            Add raw materials to your inventory.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="name"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="18k Gold"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </div>
              )}
            />
            <form.Field
              name="sku"
              children={(field) => (
                <div className="space-y-2">
                  <Label>SKU (Optional)</Label>
                  <Input
                    placeholder="GLD-18K"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            />
          </div>

          {/* --- CATEGORY & UNIT --- */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="category"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Metal">Metal</SelectItem>
                      <SelectItem value="Gemstone">Gemstone</SelectItem>
                      <SelectItem value="Finding">Finding</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
            <form.Field
              name="unit_of_measure"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grams">Grams</SelectItem>
                      <SelectItem value="carats">Carats</SelectItem>
                      <SelectItem value="pcs">Pieces</SelectItem>
                      <SelectItem value="oz">Ounces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </div>

          {/* --- STOCK & COST --- */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="current_stock"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Current Stock</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value))
                    }
                  />
                </div>
              )}
            />
            <form.Field
              name="cost_per_unit"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Cost / Unit ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value))
                    }
                  />
                </div>
              )}
            />
          </div>

          {/* --- FOOTER --- */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Material"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
