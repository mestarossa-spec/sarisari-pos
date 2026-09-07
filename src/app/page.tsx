import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const allProducts = await prisma.product.findMany({
    orderBy: { stockQuantity: "asc" },
  });
  const lowStockProducts = allProducts.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold
  );

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Sari-Sari POS</h1>

      <div className="flex gap-4">
        <Link href="/sales/new" className="rounded bg-black px-4 py-2 text-white">
          New Sale
        </Link>
        <Link href="/products" className="rounded border px-4 py-2">
          Manage Products
        </Link>
        <Link href="/sales" className="rounded border px-4 py-2">
          Sales History
        </Link>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="w-full max-w-md rounded border border-red-300 bg-red-50 p-4">
          <h2 className="mb-2 font-medium text-red-700">Low Stock Alert</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {lowStockProducts.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.name}</span>
                <span className="text-red-600">{p.stockQuantity} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}