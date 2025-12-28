import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useFinancials } from "@/hooks/use-analytics";
import { useMarketTrend } from "@/hooks/use-market";
import { useMaterials } from "@/hooks/use-inventory";
import { useTransactions } from "@/hooks/use-transactions";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: financials } = useFinancials("30d");
  const { data: marketData } = useMarketTrend();
  const { data: materials } = useMaterials();
  const { data: recentTransactions } = useTransactions();

  const currentGoldPrice =
    marketData?.data?.findLast((d: any) => !d.is_forecast)?.price || 0;
  const previousPrice =
    marketData?.data?.[marketData.data.length - 2]?.price || 0;
  const isMarketUp = currentGoldPrice >= previousPrice;

  const lowStockItems = materials?.filter((m) => m.current_stock < 10) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link to="/trade">
              <ShoppingCart className="mr-2 h-4 w-4" /> New Sale
            </Link>
          </Button>
        </div>
      </div>

      {/* --- KPI GRID --- */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* KPI 1: REVENUE (30 Days) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financials?.summary?.total_revenue?.toLocaleString() || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              +{(financials?.summary?.margin || 0).toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: MARKET PRICE */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gold Price (1g)
            </CardTitle>
            <TrendingUp
              className={`h-4 w-4 ${
                isMarketUp ? "text-green-500" : "text-red-500"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${currentGoldPrice.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Live Market Rate</p>
          </CardContent>
        </Card>

        {/* KPI 3: INVENTORY ALERTS */}
        <Card
          className={
            lowStockItems.length > 0 ? "border-orange-200 bg-orange-50/30" : ""
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Items below 10 units
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- MAIN CONTENT SPLIT --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* CHART: Revenue Overview */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Income vs Costs (Last 30 Days)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financials?.chart_data || []}>
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(str) => format(new Date(str), "dd MMM")}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    labelFormatter={(str) => format(new Date(str), "PPP")}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#0f172a"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                  <Bar
                    dataKey="cost"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    name="Cost"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* LIST: Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              Latest transactions from the Trading Desk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Show only top 5 recent */}
              {recentTransactions?.slice(0, 5).map((txn: any) => (
                <div key={txn.id} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center border">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {txn.customer_name || "Walk-in Customer"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(txn.created_at), "MMM dd, HH:mm")}
                    </p>
                  </div>
                  <div
                    className={`ml-auto font-medium ${
                      txn.transaction_type === "TRADE" && txn.total_amount < 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {txn.total_amount < 0 ? "-" : "+"}$
                    {Math.abs(txn.total_amount).toFixed(2)}
                  </div>
                </div>
              ))}

              {!recentTransactions?.length && (
                <div className="text-center text-muted-foreground py-8">
                  No transactions yet.
                </div>
              )}
            </div>

            <div className="mt-6">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/trade/history">
                  View All History <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
