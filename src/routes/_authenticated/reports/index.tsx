import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useFinancials } from "@/hooks/use-analytics";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [period, setPeriod] = useState("30d");
  const { data, isLoading } = useFinancials(period);

  if (isLoading) return <div className="p-8">Loading financials...</div>;

  const { summary, chart_data } = data || { summary: {}, chart_data: [] };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Reports
          </h1>
          <p className="text-muted-foreground">Profit & Loss Analysis</p>
        </div>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="year">Past Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary.total_revenue?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Sales & Trading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cost of Production
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${summary.total_cost?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Materials Consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                summary.gross_profit >= 0 ? "text-blue-600" : "text-red-500"
              }`}
            >
              ${summary.gross_profit?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Revenue - Costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.margin?.toFixed(1) || "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground">Efficiency Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* --- CHART SECTION --- */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>
            Comparing Income vs. Material Expenses over time.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart_data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(str) => format(new Date(str), "dd MMM")}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(str) => format(new Date(str), "PPP")}
                formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="cost"
                name="Material Cost"
                fill="#dc2626"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
