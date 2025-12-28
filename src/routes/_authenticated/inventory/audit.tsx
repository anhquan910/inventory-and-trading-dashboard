import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useMaterials,
  useSubmitAudit,
  type Material,
} from "@/hooks/use-inventory";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ClipboardCheck, Save, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/inventory/audit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: materials, isLoading } = useMaterials();
  const { mutateAsync: submitAudit, isPending } = useSubmitAudit();
  const [counts, setCounts] = useState<Record<number, number>>({});

  const handleCountChange = (id: number, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;

    setCounts((prev) => ({
      ...prev,
      [id]: num,
    }));
  };

  // Calculate stats
  const { variances, hasChanges } = useMemo(() => {
    let changeCount = 0;
    const varianceList: { id: number; diff: number; cost: number }[] = [];

    if (materials) {
      materials.forEach((m) => {
        const counted = counts[m.id];

        if (counted !== undefined && counted !== m.current_stock) {
          changeCount++;
          const diff = counted - m.current_stock;
          varianceList.push({
            id: m.id,
            diff,
            cost: diff * m.cost_per_unit,
          });
        }
      });
    }
    return { variances: varianceList, hasChanges: changeCount > 0 };
  }, [materials, counts]);

  const handleSave = async () => {
    if (!hasChanges) return;

    const payload = Object.entries(counts).map(([id, qty]) => ({
      material_id: parseInt(id),
      counted_quantity: qty,
    }));

    await submitAudit(payload);
    setCounts({});
  };

  if (isLoading) return <div className="p-8">Loading inventory...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-blue-600" />
            Stocktake Audit
          </h1>
          <p className="text-muted-foreground">
            Compare system records with physical counts.
          </p>
        </div>

        {/* ACTION BUTTON */}
        <Button
          size="lg"
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className={hasChanges ? "animate-pulse" : ""}
        >
          {isPending ? (
            "Saving..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Apply {variances.length} Adjustments
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* MAIN TABLE */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU / Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">System Stock</TableHead>
                  <TableHead className="w-[150px] text-center bg-muted/30">
                    Physical Count
                  </TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials?.map((m) => {
                  const counted = counts[m.id];
                  const diff =
                    counted !== undefined ? counted - m.current_stock : 0;
                  const isChanged =
                    counted !== undefined && counted !== m.current_stock;

                  return (
                    <TableRow
                      key={m.id}
                      className={isChanged ? "bg-muted/20" : ""}
                    >
                      <TableCell>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {m.sku}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{m.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {m.current_stock}{" "}
                        <span className="text-xs text-muted-foreground">
                          {m.unit_of_measure}
                        </span>
                      </TableCell>

                      {/* EDITABLE CELL */}
                      <TableCell className="bg-muted/30 p-2">
                        <Input
                          type="number"
                          className={`text-center font-bold ${
                            isChanged ? "border-blue-500" : ""
                          }`}
                          value={counts[m.id] ?? m.current_stock.toString()}
                          onChange={(e) =>
                            handleCountChange(m.id, e.target.value)
                          }
                        />
                      </TableCell>

                      {/* VARIANCE FEEDBACK */}
                      <TableCell className="text-right">
                        {isChanged ? (
                          <div
                            className={`font-bold ${
                              diff < 0 ? "text-red-500" : "text-green-600"
                            }`}
                          >
                            {diff > 0 ? "+" : ""}
                            {diff.toFixed(2)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* SIDEBAR SUMMARY */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Audit Summary</CardTitle>
            <CardDescription>Estimated financial impact.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {variances.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <ClipboardCheck className="w-12 h-12 mb-2 opacity-20" />
                <p>No changes recorded yet.</p>
                <p className="text-xs">
                  Start typing in the "Physical Count" column.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {variances.map((v) => (
                  <div
                    key={v.id}
                    className="flex justify-between items-center text-sm border-b pb-2"
                  >
                    <span>Item #{v.id}</span>
                    <span
                      className={v.diff < 0 ? "text-red-600" : "text-green-600"}
                    >
                      {v.cost < 0 ? "-" : "+"}${Math.abs(v.cost).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="pt-2 flex justify-between items-center font-bold text-lg">
                  <span>Total Variance:</span>
                  <span
                    className={
                      variances.reduce((a, b) => a + b.cost, 0) < 0
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    ${variances.reduce((a, b) => a + b.cost, 0).toFixed(2)}
                  </span>
                </div>

                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-xs flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <p>
                    Submitting this will permanently overwrite current stock
                    levels.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
