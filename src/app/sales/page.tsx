import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PAGE_SIZE = 20;

export default async function SalesHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const requested = parseInt(params.page ?? "1", 10);
  const page = Number.isNaN(requested) || requested < 1 ? 1 : requested;

  const [totalSales, sales] = await Promise.all([
    prisma.sale.count(),
    prisma.sale.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        items: { include: { product: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalSales / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="min-h-screen bg-stone-50 p-4 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-stone-500 p-1 text-lg">←</Link>
        <h1 className="text-xl font-bold text-stone-900">Sales History</h1>
      </div>

      {totalSales === 0 && (
        <p className="text-sm text-stone-400">No sales recorded yet.</p>
      )}

      {totalSales > 0 && sales.length === 0 && (
        <p className="text-sm text-stone-400">
          No sales on this page.{" "}
          <Link href="/sales" className="text-amber-700 font-semibold underline">
            Back to the first page
          </Link>
        </p>
      )}

      <div className="space-y-3">
        {sales.map((sale) => (
          <details key={sale.id} className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm group">
            <summary className="flex justify-between items-center cursor-pointer list-none">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 font-semibold rounded-md ${
                      sale.paymentMethod === "CASH"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-sky-100 text-sky-800"
                    }`}
                  >
                    {sale.paymentMethod === "CASH" ? "Cash" : "GCash"}
                  </span>
                  <span className="text-xs text-stone-400">
                    {sale.createdAt.toLocaleString("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Manila",
                    })}
                  </span>
                </div>
                <p className="text-sm text-stone-500">
                  {sale.items.length} {sale.items.length === 1 ? "item" : "items"} sold
                </p>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-stone-900 block">
                  ₱{Number(sale.totalAmount).toFixed(2)}
                </span>
                <span className="text-xs text-amber-700 font-semibold group-open:rotate-180 inline-block transition-transform">
                  ▼
                </span>
              </div>
            </summary>

            <div className="mt-3 pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-600">
              {sale.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-semibold text-stone-900">
                    ₱{Number(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          {hasPrev ? (
            <Link
              href={`/sales?page=${page - 1}`}
              className="h-10 px-4 bg-white border border-stone-200 text-stone-800 font-semibold text-sm rounded-xl flex items-center shadow-sm"
            >
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-xs text-stone-500">
            Page {page} of {totalPages}
          </span>
          {hasNext ? (
            <Link
              href={`/sales?page=${page + 1}`}
              className="h-10 px-4 bg-white border border-stone-200 text-stone-800 font-semibold text-sm rounded-xl flex items-center shadow-sm"
            >
              Older →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
