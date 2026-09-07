"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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

  function incrementQuantity(productId: number) {
    setCart((prev) =>
      prev.map((line) =>
        line.productId === productId && line.quantity < line.maxStock
          ? { ...line, quantity: line.quantity + 1 }
          : line
      )
    );
  }

  function decrementQuantity(productId: number) {
    setCart((prev) =>
      prev
        .map((line) =>
          line.productId === productId
            ? { ...line, quantity: line.quantity - 1 }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
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
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row md:h-screen">
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-stone-500 p-1 text-lg">←</Link>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-white shadow-sm outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stockQuantity === 0}
              className="bg-white border border-stone-200 p-3 rounded-xl text-left active:bg-amber-50 active:border-amber-600 flex flex-col justify-between h-24 shadow-sm disabled:opacity-40"
            >
              <span className="font-semibold text-sm text-stone-800 line-clamp-2">
                {product.name}
              </span>
              <div className="flex justify-between items-end w-full">
                <span className="text-xs text-stone-400">{product.unit}</span>
                <span className="font-bold text-amber-700">₱{product.price.toFixed(2)}</span>
              </div>
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-sm text-stone-400 text-center py-8">No products match your search.</p>
        )}
      </div>

      <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-stone-200 flex flex-col justify-between p-3 shadow-lg md:max-h-screen">
        <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0">
          <h2 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-1.5 mb-1.5">
            Current Cart
          </h2>

          {cart.length === 0 && (
            <p className="text-xs text-stone-400 py-2">No items yet — tap a product.</p>
          )}

          {cart.map((line) => (
            <div key={line.productId} className="flex justify-between items-center text-xs py-0.5">
              <div>
                <p className="font-semibold text-stone-800 leading-tight">{line.name}</p>
                <p className="text-[11px] text-stone-400 leading-tight">
                  ₱{line.price.toFixed(2)} x {line.quantity}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => decrementQuantity(line.productId)}
                  className="w-6 h-6 rounded-md bg-stone-100 font-bold text-stone-700 text-sm"
                >
                  −
                </button>
                <span className="font-bold text-stone-900 w-4 text-center text-xs">{line.quantity}</span>
                <button
                  onClick={() => incrementQuantity(line.productId)}
                  disabled={line.quantity >= line.maxStock}
                  className="w-6 h-6 rounded-md bg-stone-100 font-bold text-stone-700 text-sm disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-stone-200 space-y-2 shrink-0">
          <div className="flex justify-between items-end">
            <span className="text-xs text-stone-500">Total Amount</span>
            <span className="text-xl font-black text-stone-900 tabular-nums">
              ₱{total.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMethod("CASH")}
              className={`h-9 rounded-lg text-xs font-bold border-2 ${
                paymentMethod === "CASH"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-stone-200 bg-white text-stone-600"
              }`}
            >
              💵 Cash
            </button>
            <button
              onClick={() => setPaymentMethod("GCASH")}
              className={`h-9 rounded-lg text-xs font-bold border-2 ${
                paymentMethod === "GCASH"
                  ? "border-sky-600 bg-sky-50 text-sky-800"
                  : "border-stone-200 bg-white text-stone-600"
              }`}
            >
              🟦 GCash
            </button>
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={cart.length === 0 || submitting}
            className="w-full h-11 bg-emerald-600 active:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-md disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Complete Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}