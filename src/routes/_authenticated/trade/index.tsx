import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useProducts } from "@/hooks/use-products";
import { useMaterials } from "@/hooks/use-inventory";
import { useSubmitTransaction } from "@/hooks/use-trade";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  RefreshCcw,
  DollarSign,
  Trash2,
  Wallet,
} from "lucide-react";

interface CartItem {
  id: string;
  targetId: number;
  name: string;
  type: "PRODUCT" | "MATERIAL";
  quantity: number;
  price: number;
}

export const Route = createFileRoute("/_authenticated/trade/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [mode, setMode] = useState<"RETAIL" | "TRADE">("RETAIL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState("");
  const [amountPaid, setAmountPaid] = useState<string>("");
  const { data: products } = useProducts();
  const { data: materials } = useMaterials();
  const { mutateAsync: submitTxn, isPending } = useSubmitTransaction();

  const [selectedItem, setSelectedItem] = useState("");
  const [qty, setQty] = useState(1);
  const [tradeAction, setTradeAction] = useState<"BUY" | "SELL">("BUY");
  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  useEffect(() => {
    setAmountPaid(total.toString());
  }, [total]);

  const addToCart = () => {
    if (!selectedItem) return;

    if (mode === "RETAIL") {
      const product = products?.find((p) => p.id.toString() === selectedItem);
      if (!product) return;

      setCart([
        ...cart,
        {
          id: Math.random().toString(),
          targetId: product.id,
          name: product.name,
          type: "PRODUCT",
          quantity: qty,
          price: product.retail_price,
        },
      ]);
    } else {
      const material = materials?.find((m) => m.id.toString() === selectedItem);
      if (!material) return;

      const isBuying = tradeAction === "BUY";

      setCart([
        ...cart,
        {
          id: Math.random().toString(),
          targetId: material.id,
          name: `${isBuying ? "BUY (In)" : "SELL (Out)"} ${material.name}`,
          type: "MATERIAL",
          // Buying: We gain stock (+). Selling: We lose stock (-).
          quantity: isBuying ? qty : -qty,

          // Buying: We pay money (Negative Price).
          // Selling: We receive money (Positive Result required).
          // Since Qty is Negative for selling, we need Price to be Negative
          // so that (Neg * Neg = Pos)
          price: isBuying
            ? -material.cost_per_unit // (+Qty * -Price = -Total) -> We Pay
            : -material.cost_per_unit, // (-Qty * -Price = +Total) -> We Get Paid
        },
      ]);
    }

    setSelectedItem("");
    setQty(1);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((i) => i.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const paid = parseFloat(amountPaid) || 0;

    const payload = {
      type: mode,
      customer_name: customer || "Walk-in",
      amount_paid: paid,
      items: cart.map((item) => ({
        product_id: item.type === "PRODUCT" ? item.targetId : null,
        material_id: item.type === "MATERIAL" ? item.targetId : null,
        quantity: item.quantity,
        unit_price: item.price,
      })),
    };

    await submitTxn(payload);
    setCart([]);
    setCustomer("");
    setAmountPaid("");
  };

  const paidVal = parseFloat(amountPaid) || 0;
  const balance = total - paidVal;
  const isDebt = balance > 0.01;
  const isChange = balance < -0.01;

  return (
    <div className="p-8 h-[calc(100vh-4rem)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Desk</h1>
          <p className="text-muted-foreground">Point of Sale & Gold Trading</p>
        </div>

        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button
            variant={mode === "RETAIL" ? "default" : "ghost"}
            onClick={() => {
              setMode("RETAIL");
              setCart([]);
            }}
            size="sm"
          >
            Retail Sale
          </Button>
          <Button
            variant={mode === "TRADE" ? "default" : "ghost"}
            onClick={() => {
              setMode("TRADE");
              setCart([]);
            }}
            size="sm"
          >
            Gold Trade
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-full">
        {/* --- LEFT PANEL: INPUT FORM --- */}
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle>
              {mode === "RETAIL" ? "New Sale" : "Trade Gold"}
            </CardTitle>
            <CardDescription>
              {mode === "RETAIL"
                ? "Select products to add to the cart."
                : "Buy scrap gold or sell raw materials."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label>Customer Name</Label>
              <Input
                placeholder="Enter name..."
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              />
            </div>

            <Separator />

            <div className="grid gap-4">
              {mode === "RETAIL" ? (
                <div className="space-y-2">
                  <Label>Select Product</Label>
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose item..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        ?.filter((p) => p.stock_quantity > 0)
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.sku} - {p.name} (${p.retail_price})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <>
                  <div className="flex gap-4">
                    <Button
                      variant={tradeAction === "BUY" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setTradeAction("BUY")}
                    >
                      Buying (In)
                    </Button>
                    <Button
                      variant={tradeAction === "SELL" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setTradeAction("SELL")}
                    >
                      Selling (Out)
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Select Metal</Label>
                    <Select
                      value={selectedItem}
                      onValueChange={setSelectedItem}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose metal..." />
                      </SelectTrigger>
                      <SelectContent>
                        {materials?.map((m) => (
                          <SelectItem key={m.id} value={m.id.toString()}>
                            {m.name} (Current: ${m.cost_per_unit}/
                            {m.unit_of_measure})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="flex gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <Label>{mode === "RETAIL" ? "Quantity" : "Weight"}</Label>
                  <Input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(parseFloat(e.target.value))}
                  />
                </div>
                <Button onClick={addToCart} className="w-1/3">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- RIGHT PANEL: RECEIPT / CART --- */}
        <Card className="col-span-5 flex flex-col">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <RefreshCcw className="w-5 h-5" /> Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {cart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Cart is empty
              </div>
            ) : (
              <div className="divide-y">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.abs(item.quantity)} x ${item.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-bold">
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          {/* --- PAYMENT FOOTER --- */}
          <Separator />
          <CardFooter className="flex-col gap-4 bg-muted/50 p-6">
            {/* Totals Row */}
            <div className="flex justify-between w-full text-lg font-bold">
              <span>Total Due:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {/* Payment Input Row */}
            <div className="grid grid-cols-4 items-center gap-2 w-full">
              <Label className="col-span-1 text-right flex items-center justify-end gap-1">
                <Wallet className="w-4 h-4" /> Paid:
              </Label>
              <Input
                className="col-span-3 text-right font-mono"
                type="number"
                placeholder="Amount Paid"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
            </div>

            {/* Dynamic Balance / Debt Feedback */}
            {isDebt && (
              <div className="flex justify-between w-full text-sm font-semibold text-destructive animate-pulse bg-red-50 p-2 rounded">
                <span>Balance Due (Debt):</span>
                <span>${balance.toFixed(2)}</span>
              </div>
            )}
            {isChange && (
              <div className="flex justify-between w-full text-sm font-semibold text-green-600 bg-green-50 p-2 rounded">
                <span>Change Due:</span>
                <span>${Math.abs(balance).toFixed(2)}</span>
              </div>
            )}

            <Button
              className="w-full h-12 text-lg"
              disabled={cart.length === 0 || isPending}
              onClick={handleCheckout}
            >
              {isPending ? (
                "Processing..."
              ) : (
                <span className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {isDebt ? "Confirm with Debt" : "Confirm Transaction"}
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
