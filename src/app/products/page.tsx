import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteProduct } from "@/lib/actions/products";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-stone-50 p-4 space-y-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-stone-500 p-1 text-lg">←</Link>
          <h1 className="text-xl font-bold text-stone-900">Products</h1>
        </div>
        <Link
          href="/products/new"
          className="h-10 px-4 bg-amber-600 text-white font-semibold text-sm rounded-xl flex items-center gap-1 shadow-sm"
        >
          <span>+</span> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-stone-100 border-b border-stone-200 text-stone-600 text-xs uppercase">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => {
                const isLow = p.stockQuantity <= p.lowStockThreshold;
                return (
                  <tr key={p.id} className={isLow ? "bg-rose-50/30" : ""}>
                    <td className="p-3 font-medium text-stone-900">{p.name}</td>
                    <td className="p-3 text-stone-500">{p.unit}</td>
                    <td className="p-3 font-semibold text-stone-900">
                      ₱{Number(p.price).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium ${
                          isLow
                            ? "bg-rose-100 text-rose-700 font-bold"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {isLow && "⚠️ "}
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        href={`/products/${p.id}/edit`}
                        className="text-xs text-amber-700 font-semibold p-1"
                      >
                        Edit
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteProduct(p.id);
                        }}
                        className="inline"
                      >
                        <button type="submit" className="text-xs text-rose-600 font-semibold p-1">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <p className="p-4 text-sm text-stone-400">No products yet — add your first one.</p>
        )}
      </div>
    </div>
  );
}