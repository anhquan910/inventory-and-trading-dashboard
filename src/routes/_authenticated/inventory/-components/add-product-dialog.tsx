import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useCreateProduct } from "@/hooks/use-products";

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
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { FieldError } from "@/components/ui/field";

// 1. Validation Schema
const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(1, "SKU is required"), // SKU is mandatory for tracking sales
  category: z.string().min(1, "Category is required"),
  retail_price: z.number().min(0, "Price cannot be negative"),
  manufacture_cost: z.number().min(0, "Cost cannot be negative"),
  stock_quantity: z.number().int().min(0, "Stock cannot be negative"),
});

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useCreateProduct();

  const form = useForm({
    defaultValues: {
      name: "",
      sku: "",
      category: "Ring",
      retail_price: 0,
      manufacture_cost: 0,
      stock_quantity: 1,
    },
    validators: {
      onChange: productSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync(value);
        setOpen(false);
        form.reset();
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Finished Good</DialogTitle>
          <DialogDescription>
            Add a new retail item to your FGIS (Finished Goods Inventory
            System).
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
          {/* --- ROW 1: Identity --- */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="sku"
              children={(field) => (
                <div className="space-y-2">
                  <Label>SKU (Unique ID)</Label>
                  <Input
                    placeholder="RN-DIA-001"
                    className="font-mono uppercase"
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
                      <SelectItem value="Ring">Ring</SelectItem>
                      <SelectItem value="Necklace">Necklace</SelectItem>
                      <SelectItem value="Earrings">Earrings</SelectItem>
                      <SelectItem value="Bracelet">Bracelet</SelectItem>
                      <SelectItem value="Pendant">Pendant</SelectItem>
                      <SelectItem value="Watch">Watch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </div>

          {/* --- ROW 2: Name --- */}
          <form.Field
            name="name"
            children={(field) => (
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  placeholder="Diamond Solitaire Ring"
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

          {/* --- ROW 3: Financials --- */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="manufacture_cost"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Cost of Goods ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value))
                    }
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Internal cost to make
                  </p>
                </div>
              )}
            />
            <form.Field
              name="retail_price"
              children={(field) => (
                <div className="space-y-2">
                  <Label className="text-green-700">Retail Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="font-bold"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value))
                    }
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Selling price tag
                  </p>
                </div>
              )}
            />
          </div>

          {/* --- ROW 4: Stock --- */}
          <form.Field
            name="stock_quantity"
            children={(field) => (
              <div className="space-y-2">
                <Label>Initial Stock Quantity</Label>
                <Input
                  type="number"
                  step="1"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(parseInt(e.target.value))}
                />
              </div>
            )}
          />

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
              {isPending ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
