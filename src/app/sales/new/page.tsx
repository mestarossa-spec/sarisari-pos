import { prisma } from "@/lib/prisma";
import SaleForm from "@/components/SaleForm";

export default async function NewSalePage() {
  const products = await prisma.product.findMany({
    where: { stockQuantity: { gt: 0 } },
    orderBy: { name: "asc" },
  });

  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit,
    price: Number(p.price),
    stockQuantity: p.stockQuantity,
  }));

  return <SaleForm products={serializedProducts} />;
}