import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMarketTrend } from "@/hooks/use-market";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Calculator } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/market/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: marketPayload, isLoading } = useMarketTrend();

  const trendData = marketPayload?.data || [];
  const accuracy = marketPayload?.model_accuracy || 0;
  const [grams, setGrams] = useState<number>(10);

  const currentPrice =
    trendData?.findLast((d: any) => !d.is_forecast)?.price || 0;
  const predictedPrice = trendData?.[trendData.length - 1]?.price || 0;

  const currentValue = grams * currentPrice;
  const predictedValue = grams * predictedPrice;
  const profit = predictedValue - currentValue;

  const chartData = useMemo(() => {
    if (!trendData.length) return [];

    return trendData.map((item: any, index: number) => {
      const isTransitionPoint =
        !item.is_forecast && trendData[index + 1]?.is_forecast;

      return {
        ...item,
        actualPrice: !item.is_forecast || isTransitionPoint ? item.price : null,
        forecastPrice:
          item.is_forecast || isTransitionPoint ? item.price : null,
      };
    });
  }, [trendData]);

  if (isLoading) return <div className="p-8">Loading Analytics...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Market Analytics
          </h1>
          <p className="text-muted-foreground">AI-Powered Price Predictions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* --- CHART SECTION --- */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              AI Trend Analysis
              {accuracy > 0 && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-green-50 text-green-700 border-green-200"
                >
                  AI Confidence: {accuracy}% (R²)
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Solid line = Historical Data.{" "}
              <span className="text-purple-600 font-semibold">
                Dashed line = AI Forecast.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {/* Pass the transformed 'chartData' here */}
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  {/* Optional: Different gradient for forecast */}
                  <linearGradient
                    id="colorForecast"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(str) => format(new Date(str), "MMM dd")}
                  minTickGap={30}
                />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip
                  labelFormatter={(label) => format(new Date(label), "PPP")}
                  // Custom tooltip to handle the split data cleanly
                  formatter={(value: number, name: string) => {
                    // Normalize the name for the tooltip
                    const label =
                      name === "actualPrice" ? "Actual Price" : "AI Prediction";
                    return [`$${value.toFixed(2)}`, label];
                  }}
                />

                {/* AREA 1: ACTUAL DATA (Solid Blue) */}
                <Area
                  type="monotone"
                  dataKey="actualPrice"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  connectNulls={false} // Don't bridge gaps automatically
                />

                {/* AREA 2: FORECAST DATA (Dashed Purple) */}
                <Area
                  type="monotone"
                  dataKey="forecastPrice"
                  stroke="#9333ea" // Purple for prediction
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={0.5}
                  fill="url(#colorForecast)"
                  connectNulls={false}
                />

                {/* Vertical Line marking Today */}
                <ReferenceLine
                  x={format(new Date(), "yyyy-MM-dd")}
                  stroke="red"
                  strokeDasharray="3 3"
                  label="Today"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* --- CALCULATOR SECTION (Unchanged) --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Impact Calculator
            </CardTitle>
            <CardDescription>Estimated value change.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Gold Quantity (grams)</Label>
              <Input
                type="number"
                value={grams}
                onChange={(e) => setGrams(parseFloat(e.target.value))}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex justify-between text-sm">
                <span>Current Price:</span>
                <span className="font-mono">${currentPrice.toFixed(2)}/g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Forecast Price (7d):</span>
                <span className="font-mono text-blue-600 font-bold">
                  ${predictedPrice.toFixed(2)}/g
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold">Projected Value:</span>
                <div className="text-right">
                  <div className="text-xl font-bold">
                    ${predictedValue.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs ${
                      profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {profit >= 0 ? "+" : ""}
                    {profit.toFixed(2)} (
                    {((profit / currentValue) * 100).toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              *Predictions are based on simulated volatility models and should
              not be used as sole financial advice.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
