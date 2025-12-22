import type { ColumnDef } from "@tanstack/react-table";
import type { Material } from "@/hooks/use-inventory";
import { Badge } from "@/components/ui/badge";
import { EditMaterialDialog } from "./edit-material-dialog";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil } from "lucide-react";

export const columns: ColumnDef<Material>[] = [
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue("sku") || "—"}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Material Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("category")}</Badge>
    ),
  },
  {
    accessorKey: "current_stock",
    header: "Stock Level",
    cell: ({ row }) => {
      const stock = parseFloat(row.getValue("current_stock"));
      const unit = row.original.unit_of_measure;
      const reorder = row.original.reorder_level;
      const isLow = stock <= reorder;

      return (
        <div className={isLow ? "text-red-500 font-bold" : ""}>
          {stock} <span className="text-muted-foreground text-xs">{unit}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "cost_per_unit",
    header: () => <div className="text-right">Cost / Unit</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cost_per_unit"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "total_value",
    header: () => <div className="text-right">Total Value</div>,
    cell: ({ row }) => {
      const stock = row.original.current_stock;
      const cost = row.original.cost_per_unit;
      const total = stock * cost;

      return (
        <div className="text-right font-bold">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(total)}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const material = row.original;
      return <ActionCell material={material} />;
    },
  },
];

const ActionCell = ({ material }: { material: Material }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit / Update Stock
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditMaterialDialog
        material={material}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
};
