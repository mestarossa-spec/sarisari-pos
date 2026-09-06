import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/lib/actions/products";
import { notFound } from "next/navigation";

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
    <div className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Edit Product</h1>
      <form action={updateWithId} className="flex max-w-sm flex-col gap-3">
        <input name="name" defaultValue={product.name} className="rounded border px-3 py-2" required />
        <input name="unit" defaultValue={product.unit} className="rounded border px-3 py-2" required />
        <input name="price" type="number" step="0.01" defaultValue={product.price.toString()} className="rounded border px-3 py-2" required />
        <input name="stockQuantity" type="number" defaultValue={product.stockQuantity} className="rounded border px-3 py-2" required />
        <input name="lowStockThreshold" type="number" defaultValue={product.lowStockThreshold} className="rounded border px-3 py-2" required />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Update Product
        </button>
      </form>
    </div>
  );
}