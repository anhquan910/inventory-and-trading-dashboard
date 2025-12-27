import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useTransactions,
  useMarkPaid,
  type Transaction,
} from "@/hooks/use-transactions";
import { DataTable } from "../inventory/-components/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Printer, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trade/history")({
  component: RouteComponent,
});

const printReceipt = (txn: Transaction) => {
  const windowContent = `
    <html>
      <head><title>Receipt #${txn.id}</title></head>
      <body style="font-family: monospace; padding: 20px;">
        <h2>Jewellery Dashboard</h2>
        <p>Date: ${new Date(txn.created_at).toLocaleString()}</p>
        <p>Customer: ${txn.customer_name}</p>
        <hr/>
        <h3>Total: $${txn.total_amount.toFixed(2)}</h3>
        <p>Paid: $${(txn.total_amount - txn.balance_due).toFixed(2)}</p>
        <p><strong>Balance Due: $${txn.balance_due.toFixed(2)}</strong></p>
        <hr/>
        <p>Thank you for your business!</p>
      </body>
    </html>
  `;
  const printWin = window.open("", "", "width=400,height=600");
  printWin?.document.write(windowContent);
  printWin?.print();
};

const getColumns = (
  markPaid: (id: number) => void
): ColumnDef<Transaction>[] => [
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(row.getValue("created_at")), "MMM dd, HH:mm")}
      </span>
    ),
  },
  {
    accessorKey: "customer_name",
    header: "Customer",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.getValue("customer_name") || "Walk-in"}
      </span>
    ),
  },
  {
    accessorKey: "transaction_type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("transaction_type") as string;
      return (
        <Badge variant={type === "RETAIL" ? "default" : "outline"}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => (
      <div className="font-bold">
        ${(row.getValue("total_amount") as number).toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const balance = row.original.balance_due;

      if (status === "PENDING") {
        return (
          <Badge variant="destructive" className="animate-pulse">
            Unpaid (${balance.toFixed(2)})
          </Badge>
        );
      }
      return (
        <Badge variant="secondary" className="text-green-600">
          Paid
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const txn = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => printReceipt(txn)}>
              <Printer className="mr-2 h-4 w-4" /> Print Receipt
            </DropdownMenuItem>
            {txn.status === "PENDING" && (
              <DropdownMenuItem onClick={() => markPaid(txn.id)}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Mark as
                Paid
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function RouteComponent() {
  const [showDebtOnly, setShowDebtOnly] = useState(false);
  const { data: transactions, isLoading } = useTransactions(
    showDebtOnly ? "PENDING" : undefined
  );
  const { mutate: markPaid } = useMarkPaid();

  if (isLoading) return <div className="p-8">Loading ledger...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-muted-foreground">
            View history and track customer debts.
          </p>
        </div>

        {/* Debt Filter Toggle */}
        <div className="flex items-center space-x-2 bg-muted p-2 rounded-lg">
          <Switch
            id="debt-mode"
            checked={showDebtOnly}
            onCheckedChange={setShowDebtOnly}
          />
          <Label htmlFor="debt-mode" className="cursor-pointer">
            Show Unpaid Debts Only
          </Label>
        </div>
      </div>

      <DataTable columns={getColumns(markPaid)} data={transactions || []} />
    </div>
  );
}
