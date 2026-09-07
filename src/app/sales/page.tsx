import { prisma } from "@/lib/prisma";

export default async function SalesHistoryPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  return (
    <div className="p-8">
      <h1 className="mb-4 text-xl font-semibold">Sales History</h1>

      {sales.length === 0 && (
        <p className="text-sm text-gray-500">No sales recorded yet.</p>
      )}

      <div className="flex flex-col gap-4">
        {sales.map((sale) => (
          <div key={sale.id} className="rounded border p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {sale.createdAt.toLocaleString("en-PH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
                <div className="text-sm text-gray-500">
                  Payment: {sale.paymentMethod}
                </div>
              </div>
              <div className="text-lg font-semibold">
                ₱{Number(sale.totalAmount).toFixed(2)}
              </div>
            </div>

            <table className="w-full text-sm">
              <tbody>
                {sale.items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="py-1">{item.product.name}</td>
                    <td className="py-1 text-gray-500">
                      {item.quantity} × ₱{Number(item.unitPriceSnapshot).toFixed(2)}
                    </td>
                    <td className="py-1 text-right">
                      ₱{Number(item.subtotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}