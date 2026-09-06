import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Sari-Sari POS</h1>
      <Link href="/products" className="underline">
        Manage Products →
      </Link>
    </div>
  );
}