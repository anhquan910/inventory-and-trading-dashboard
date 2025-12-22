import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center border">
          KPI 1
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center border">
          KPI 2
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center border">
          KPI 3
        </div>
      </div>
      <div className="bg-muted/50 min-h-[50vh] flex-1 rounded-xl border md:min-h-min" />
    </div>
  );
}
