import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/lib/actions/products";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id, 10) },
  });

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, product.id);

  return (
    <div className="min-h-screen bg-stone-50 p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/products" className="text-stone-500 p-1">←</Link>
        <h1 className="text-xl font-bold text-stone-900">Edit Product</h1>
      </div>

      <form action={updateWithId} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Product Name</label>
          <input
            name="name"
            type="text"
            defaultValue={product.name}
            required
            className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-600 outline-none text-stone-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Unit</label>
            <input
              name="unit"
              type="text"
              defaultValue={product.unit}
              required
              className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-600 outline-none text-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Price (₱)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={product.price.toString()}
              required
              className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-600 outline-none text-stone-900 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Stock Quantity</label>
            <input
              name="stockQuantity"
              type="number"
              defaultValue={product.stockQuantity}
              required
              className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-600 outline-none text-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Low Stock Limit</label>
            <input
              name="lowStockThreshold"
              type="number"
              defaultValue={product.lowStockThreshold}
              required
              className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-600 outline-none text-stone-900"
            />
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <Link
            href="/products"
            className="w-1/2 h-12 bg-stone-100 text-stone-700 font-semibold rounded-xl flex items-center justify-center"
          >
            Cancel
          </Link>
          <button type="submit" className="w-1/2 h-12 bg-amber-600 text-white font-semibold rounded-xl shadow-sm">
            Update Product
          </button>
        </div>
      </form>
    </div>
  );
}