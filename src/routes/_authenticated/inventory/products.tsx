import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useProducts, type Product } from "@/hooks/use-product";
import { DataTable } from "./-components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { AddProductDialog } from "./-components/add-product-dialog";
import { RecipeDialog } from "./-components/recipe-dialog";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Beaker, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/_authenticated/inventory/products")({
  component: RouteComponent,
});

interface TableMeta {
  onManageRecipe: (product: Product) => void;
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue("sku")}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.getValue("category")}</Badge>
    ),
  },
  {
    accessorKey: "stock_quantity",
    header: "Stock",
    cell: ({ row }) => (
      <div className="font-bold">{row.getValue("stock_quantity")}</div>
    ),
  },
  {
    accessorKey: "manufacture_cost",
    header: "Cost (COGS)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("manufacture_cost"));
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    },
  },
  {
    accessorKey: "retail_price",
    header: "Retail Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("retail_price"));
      return (
        <span className="text-green-600 font-bold">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(amount)}
        </span>
      );
    },
  },
  {
    id: "margin",
    header: "Est. Margin",
    cell: ({ row }) => {
      const cost = row.original.manufacture_cost;
      const price = row.original.retail_price;
      const margin = price - cost;
      const percent = price > 0 ? (margin / price) * 100 : 0;

      return (
        <div className="text-xs">
          <div>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(margin)}
          </div>
          <div className="text-muted-foreground">{percent.toFixed(1)}%</div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => meta?.onManageRecipe(row.original)}
            >
              <Beaker className="mr-2 h-4 w-4" /> Manage Recipe (BOM)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function RouteComponent() {
  const { data: products, isLoading } = useProducts();

  const [recipeProduct, setRecipeProduct] = useState<Product | null>(null);
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);

  const handleManageRecipe = (product: Product) => {
    setRecipeProduct(product);
    setIsRecipeOpen(true);
  };

  if (isLoading) return <div className="p-8">Loading products...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Finished Goods (FGIS)
          </h1>
          <p className="text-muted-foreground">
            Manage your retail inventory, pricing, and margins.
          </p>
        </div>
        <AddProductDialog />
      </div>

      <DataTable
        columns={columns}
        data={products || []}
        meta={{ onManageRecipe: handleManageRecipe }}
      />

      <RecipeDialog
        product={recipeProduct}
        open={isRecipeOpen}
        onOpenChange={setIsRecipeOpen}
      />
    </div>
  );
}
