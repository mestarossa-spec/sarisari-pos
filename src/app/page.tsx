import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const allProducts = await prisma.product.findMany({
    orderBy: { stockQuantity: "asc" },
  });
  const lowStockProducts = allProducts.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold
  );

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-stone-50 p-4 space-y-6 max-w-md mx-auto md:max-w-4xl">
      <header className="flex justify-between items-center pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-lg font-bold text-stone-900">Sari-Sari POS</h1>
          <p className="text-xs text-stone-500">{today}</p>
        </div>
        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
          Admin
        </span>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/sales/new"
          className="h-20 bg-emerald-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm active:scale-95 transition-transform"
        >
          <div className="text-left">
            <span className="block text-xs opacity-90">Start</span>
            <span className="text-lg font-bold">New Sale</span>
          </div>
          <span className="text-2xl">🛒</span>
        </Link>
        <Link
          href="/products"
          className="h-20 bg-white border border-stone-200 text-stone-800 p-4 rounded-2xl flex items-center justify-between shadow-sm active:scale-95 transition-transform"
        >
          <div className="text-left">
            <span className="block text-xs text-stone-500">Inventory</span>
            <span className="text-base font-bold">Products</span>
          </div>
          <span className="text-2xl">📦</span>
        </Link>
        <Link
          href="/sales"
          className="h-20 bg-white border border-stone-200 text-stone-800 p-4 rounded-2xl flex items-center justify-between shadow-sm active:scale-95 transition-transform"
        >
          <div className="text-left">
            <span className="block text-xs text-stone-500">Records</span>
            <span className="text-base font-bold">Sales History</span>
          </div>
          <span className="text-2xl">📊</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            Low Stock Alerts
          </h2>
          {lowStockProducts.length > 0 && (
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
              {lowStockProducts.length} {lowStockProducts.length === 1 ? "Item" : "Items"}
            </span>
          )}
        </div>

        {lowStockProducts.length === 0 ? (
          <p className="text-sm text-stone-400">All stock levels look good.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {lowStockProducts.map((p) => (
              <li key={p.id} className="py-2.5 flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-stone-800">{p.name}</p>
                  <p className="text-xs text-stone-400">{p.unit}</p>
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                  {p.stockQuantity} left
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}