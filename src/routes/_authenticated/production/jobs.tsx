import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { format } from "date-fns";
import { DataTable } from "../inventory/-components/data-table";
import { type ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Hammer, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/production/jobs")({
  component: RouteComponent,
});

interface Job {
  id: number;
  product_name: string;
  quantity: number;
  total_cost: number;
  created_at: string;
  created_by: string;
}

const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "created_at",
    header: "Date Completed",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {format(new Date(row.getValue("created_at")), "MMM dd, HH:mm")}
      </span>
    ),
  },
  {
    accessorKey: "product_name",
    header: "Product",
    cell: ({ row }) => (
      <span className="font-semibold">{row.getValue("product_name")}</span>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Qty Produced",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-mono text-blue-700">
          +{row.getValue("quantity")} units
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "total_cost",
    header: "Total Cost",
    cell: ({ row }) => (
      <span>${(row.getValue("total_cost") as number).toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "created_by",
    header: "Operator",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.getValue("created_by")}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: () => (
      <div className="flex items-center text-green-600 text-xs font-medium">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Completed
      </div>
    ),
  },
];

function RouteComponent() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["production-jobs"],
    queryFn: async () => {
      const res = await api.get<Job[]>("/production/jobs");
      return res.data;
    },
  });

  if (isLoading) return <div className="p-8">Loading jobs...</div>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Hammer className="w-8 h-8 text-orange-500" />
          Production History
        </h1>
        <p className="text-muted-foreground">
          Log of all completed manufacturing jobs and material usage.
        </p>
      </div>

      <DataTable columns={columns} data={jobs || []} />
    </div>
  );
}
