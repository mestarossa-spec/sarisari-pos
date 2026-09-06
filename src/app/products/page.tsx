import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteProduct } from "@/lib/actions/products";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/products/new" className="rounded bg-black px-4 py-2 text-white">
          + Add Product
        </Link>
      </div>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Name</th>
            <th className="py-2">Unit</th>
            <th className="py-2">Price</th>
            <th className="py-2">Stock</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.name}</td>
              <td className="py-2">{p.unit}</td>
              <td className="py-2">₱{p.price.toString()}</td>
              <td className="py-2">
                {p.stockQuantity}
                {p.stockQuantity <= p.lowStockThreshold && (
                  <span className="ml-2 text-red-600">(low)</span>
                )}
              </td>
              <td className="py-2">
                <Link href={`/products/${p.id}/edit`} className="mr-3 underline">
                  Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteProduct(p.id);
                  }}
                  className="inline"
                >
                  <button type="submit" className="text-red-600 underline">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}