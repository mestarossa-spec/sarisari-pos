import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Group = "day" | "week" | "month";
type ProductTotals = { name: string; unit: string; quantity: number; revenue: number };

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toManilaDateString(date: Date): string {
  return new Date(date.getTime() + MANILA_OFFSET_MS).toISOString().slice(0, 10);
}

function isValidDateString(value: string | undefined): value is string {
  if (!value || !DATE_RE.test(value)) return false;
  return !Number.isNaN(new Date(`${value}T00:00:00+08:00`).getTime());
}

function periodKey(date: Date, group: Group): string {
  const local = new Date(date.getTime() + MANILA_OFFSET_MS);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const d = local.getUTCDate();

  if (group === "month") {
    return `${y}-${String(m + 1).padStart(2, "0")}`;
  }
  if (group === "week") {
    const daysSinceMonday = (local.getUTCDay() + 6) % 7;
    return new Date(Date.UTC(y, m, d - daysSinceMonday)).toISOString().slice(0, 10);
  }
  return local.toISOString().slice(0, 10);
}

const peso = (n: number) => `₱${n.toFixed(2)}`;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; group?: string }>;
}) {
  const params = await searchParams;

  const today = toManilaDateString(new Date());
  const defaultFrom = toManilaDateString(
    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  );

  const from = isValidDateString(params.from) ? params.from : defaultFrom;
  const to = isValidDateString(params.to) ? params.to : today;
  const group: Group =
    params.group === "week" || params.group === "month" ? params.group : "day";
  const invalidRange = from > to;

  const [products, sales] = await Promise.all([
    prisma.product.findMany({
      orderBy: { stockQuantity: "asc" },
    }),
    invalidRange
      ? Promise.resolve([])
      : prisma.sale.findMany({
          where: {
            createdAt: {
              gte: new Date(`${from}T00:00:00+08:00`),
              lte: new Date(`${to}T23:59:59.999+08:00`),
            },
          },
          orderBy: { createdAt: "asc" },
          include: { items: { include: { product: true } } },
        }),
  ]);

  const lowStockCount = products.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold
  ).length;

  let totalRevenue = 0;
  const byPeriod = new Map<string, { count: number; total: number }>();
  const byPayment = {
    CASH: { count: 0, total: 0 },
    GCASH: { count: 0, total: 0 },
  };
  const byProduct = new Map<number, ProductTotals>();

  for (const sale of sales) {
    const amount = Number(sale.totalAmount);
    totalRevenue += amount;

    const key = periodKey(sale.createdAt, group);
    const period = byPeriod.get(key) ?? { count: 0, total: 0 };
    period.count += 1;
    period.total += amount;
    byPeriod.set(key, period);

    byPayment[sale.paymentMethod].count += 1;
    byPayment[sale.paymentMethod].total += amount;

    for (const item of sale.items) {
      const entry = byProduct.get(item.productId) ?? {
        name: item.product.name,
        unit: item.product.unit,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += Number(item.subtotal);
      byProduct.set(item.productId, entry);
    }
  }

  const periods = Array.from(byPeriod.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const topProducts = Array.from(byProduct.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const cardClass = "bg-white rounded-2xl border border-stone-200 shadow-sm";
  const thClass = "p-3";
  const tdClass = "p-3";

  return (
    <div className="min-h-screen bg-stone-50 p-4 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <Link href="/" className="text-stone-500 p-1 text-lg">←</Link>
        <h1 className="text-xl font-bold text-stone-900">Reports</h1>
      </div>

      <form method="GET" action="/reports" className={`${cardClass} p-4 flex flex-wrap items-end gap-3`}>
        <div>
          <label className="block text-xs font-bold uppercase text-stone-600 mb-1">From</label>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="h-12 px-3 rounded-xl border border-stone-300 text-stone-900"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-stone-600 mb-1">To</label>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="h-12 px-3 rounded-xl border border-stone-300 text-stone-900"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Group by</label>
          <select
            name="group"
            defaultValue={group}
            className="h-12 px-3 rounded-xl border border-stone-300 text-stone-900 bg-white"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-12 px-5 bg-amber-600 text-white font-semibold rounded-xl shadow-sm"
        >
          Apply
        </button>
      </form>

      {invalidRange && (
        <p className="text-sm text-rose-600">
          The From date is after the To date. Please adjust the range.
        </p>
      )}

      {!invalidRange && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className={`${cardClass} p-4`}>
              <p className="text-xs text-stone-500">Total sales</p>
              <p className="text-2xl font-black text-stone-900 tabular-nums">{peso(totalRevenue)}</p>
            </div>
            <div className={`${cardClass} p-4`}>
              <p className="text-xs text-stone-500">Number of sales</p>
              <p className="text-2xl font-black text-stone-900 tabular-nums">{sales.length}</p>
            </div>
          </div>

          <section className={`${cardClass} overflow-hidden`}>
            <h2 className="p-4 pb-2 text-sm font-bold text-stone-900">
              Sales by {group}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100 text-stone-600 text-xs uppercase">
                  <tr>
                    <th className={thClass}>{group === "day" ? "Date" : group === "week" ? "Week starting" : "Month"}</th>
                    <th className={thClass}>Sales</th>
                    <th className={`${thClass} text-right`}>Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {periods.map(([key, value]) => (
                    <tr key={key}>
                      <td className={`${tdClass} font-medium text-stone-900`}>{key}</td>
                      <td className={tdClass}>{value.count}</td>
                      <td className={`${tdClass} text-right font-semibold tabular-nums`}>{peso(value.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {periods.length === 0 && (
              <p className="p-4 text-sm text-stone-400">No sales in this date range.</p>
            )}
          </section>

          <section className={`${cardClass} p-4`}>
            <h2 className="text-sm font-bold text-stone-900 mb-3">Cash vs GCash</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border-2 border-emerald-600 bg-emerald-50 p-3">
                <p className="text-xs font-semibold text-emerald-800">💵 Cash</p>
                <p className="text-lg font-black text-stone-900 tabular-nums">{peso(byPayment.CASH.total)}</p>
                <p className="text-xs text-stone-500">{byPayment.CASH.count} sales</p>
              </div>
              <div className="rounded-xl border-2 border-sky-600 bg-sky-50 p-3">
                <p className="text-xs font-semibold text-sky-800">🟦 GCash</p>
                <p className="text-lg font-black text-stone-900 tabular-nums">{peso(byPayment.GCASH.total)}</p>
                <p className="text-xs text-stone-500">{byPayment.GCASH.count} sales</p>
              </div>
            </div>
          </section>

          <section className={`${cardClass} overflow-hidden`}>
            <h2 className="p-4 pb-2 text-sm font-bold text-stone-900">
              Best-selling products (top 10)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100 text-stone-600 text-xs uppercase">
                  <tr>
                    <th className={thClass}>Product</th>
                    <th className={thClass}>Qty sold</th>
                    <th className={`${thClass} text-right`}>Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {topProducts.map((p) => (
                    <tr key={p.name + p.unit}>
                      <td className={`${tdClass} font-medium text-stone-900`}>
                        {p.name} <span className="text-xs text-stone-400">({p.unit})</span>
                      </td>
                      <td className={tdClass}>{p.quantity}</td>
                      <td className={`${tdClass} text-right font-semibold tabular-nums`}>{peso(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {topProducts.length === 0 && (
              <p className="p-4 text-sm text-stone-400">No sales in this date range.</p>
            )}
          </section>
        </>
      )}

      <section className={`${cardClass} overflow-hidden`}>
        <div className="p-4 pb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900">Inventory status</h2>
          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
            {lowStockCount} low
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 text-stone-600 text-xs uppercase">
              <tr>
                <th className={thClass}>Product</th>
                <th className={thClass}>Stock</th>
                <th className={thClass}>Low limit</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => {
                const isLow = p.stockQuantity <= p.lowStockThreshold;
                return (
                  <tr key={p.id} className={isLow ? "bg-rose-50/30" : ""}>
                    <td className={`${tdClass} font-medium text-stone-900`}>
                      {p.name} <span className="text-xs text-stone-400">({p.unit})</span>
                    </td>
                    <td className={tdClass}>{p.stockQuantity}</td>
                    <td className={tdClass}>{p.lowStockThreshold}</td>
                    <td className={tdClass}>
                      <span
                        className={`text-xs px-2 py-1 rounded-md font-medium ${
                          isLow
                            ? "bg-rose-100 text-rose-700 font-bold"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {isLow ? "Low" : "OK"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <p className="p-4 text-sm text-stone-400">No products yet.</p>
        )}
      </section>
    </div>
  );
}
