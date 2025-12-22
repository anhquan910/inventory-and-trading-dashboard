import { createFileRoute } from "@tanstack/react-router";
import { useMaterials } from "@/hooks/use-inventory";
import { columns } from "./-components/column";
import { DataTable } from "./-components/data-table";
import { AddMaterialDialog } from "./-components/add-material-dialog";

export const Route = createFileRoute("/_authenticated/inventory/materials")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: materials, isLoading, isError } = useMaterials();

  if (isLoading) return <div className="p-8">Loading inventory...</div>;
  if (isError)
    return <div className="p-8 text-red-500">Error loading inventory.</div>;

  return (
    <div className="p-8 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Materials Inventory
          </h1>
          <p className="text-muted-foreground">
            Manage raw gold, silver, and findings.
          </p>
        </div>
        <AddMaterialDialog />
      </div>

      {/* The Data Table */}
      <DataTable columns={columns} data={materials || []} />
    </div>
  );
}
