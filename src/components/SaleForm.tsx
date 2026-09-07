"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSale } from "@/lib/actions/sales";

type Product = {
  id: number;
  name: string;
  unit: string;
  price: number;
  stockQuantity: number;
};

type CartLine = {
  productId: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  maxStock: number;
};

export default function SaleForm({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "GCASH">("CASH");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  function addToCart(product: Product) {
    setError(null);
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prev;
        return prev.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          price: product.price,
          quantity: 1,
          maxStock: product.stockQuantity,
        },
      ];
    });
  }

  function updateQuantity(productId: number, quantity: number) {
    setCart((prev) =>
      prev
        .map((line) =>
          line.productId === productId
            ? { ...line, quantity: Math.min(quantity, line.maxStock) }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((line) => line.productId !== productId));
  }

  const total = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);

    const result = await createSale(
      cart.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      paymentMethod
    );

    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push("/products");
  }

  return (
    <div className="flex gap-8">
      <div className="grid flex-1 grid-cols-3 gap-3">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => addToCart(product)}
            className="rounded border p-3 text-left hover:bg-gray-50"
          >
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-gray-500">
              ₱{product.price.toFixed(2)} / {product.unit}
            </div>
            <div className="text-xs text-gray-400">Stock: {product.stockQuantity}</div>
          </button>
        ))}
      </div>

      <div className="w-80 shrink-0 rounded border p-4">
        <h2 className="mb-3 font-semibold">Cart</h2>

        {cart.length === 0 && (
          <p className="text-sm text-gray-500">No items yet — click a product.</p>
        )}

        {cart.map((line) => (
          <div key={line.productId} className="mb-2 flex items-center justify-between gap-2 text-sm">
            <div className="flex-1">
              <div>{line.name}</div>
              <div className="text-gray-500">
                ₱{line.price.toFixed(2)} × {line.quantity} = ₱{(line.price * line.quantity).toFixed(2)}
              </div>
            </div>
            <input
              type="number"
              min={1}
              max={line.maxStock}
              value={line.quantity}
              onChange={(e) => updateQuantity(line.productId, parseInt(e.target.value, 10) || 0)}
              className="w-14 rounded border px-1 py-0.5"
            />
            <button onClick={() => removeFromCart(line.productId)} className="text-red-600">
              ✕
            </button>
          </div>
        ))}

        <div className="mt-4 border-t pt-3 font-semibold">Total: ₱{total.toFixed(2)}</div>

        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium">Payment Method</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPaymentMethod("CASH")}
              className={`flex-1 rounded border px-3 py-2 ${paymentMethod === "CASH" ? "bg-black text-white" : ""}`}
            >
              Cash
            </button>
            <button
              onClick={() => setPaymentMethod("GCASH")}
              className={`flex-1 rounded border px-3 py-2 ${paymentMethod === "GCASH" ? "bg-black text-white" : ""}`}
            >
              GCash
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={cart.length === 0 || submitting}
          className="mt-4 w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Processing..." : "Complete Sale"}
        </button>
      </div>
    </div>
  );
}