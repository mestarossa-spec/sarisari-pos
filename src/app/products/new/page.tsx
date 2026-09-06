import { createProduct } from "@/lib/actions/products";

export default function NewProductPage() {
  return (
    <div className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Add Product</h1>
      <form action={createProduct} className="flex max-w-sm flex-col gap-3">
        <input name="name" placeholder="Name" className="rounded border px-3 py-2" required />
        <input name="unit" placeholder="Unit (e.g. pc, sachet)" className="rounded border px-3 py-2" required />
        <input name="price" type="number" step="0.01" placeholder="Price" className="rounded border px-3 py-2" required />
        <input name="stockQuantity" type="number" placeholder="Starting stock" className="rounded border px-3 py-2" required />
        <input name="lowStockThreshold" type="number" placeholder="Low stock alert level" defaultValue={5} className="rounded border px-3 py-2" required />
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Save Product
        </button>
      </form>
    </div>
  );
}