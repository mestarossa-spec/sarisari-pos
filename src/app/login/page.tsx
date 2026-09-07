import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex p-3 bg-amber-100 text-amber-700 rounded-full mb-2">
            <span className="text-2xl font-bold">🏪</span>
          </div>
          <h1 className="text-xl font-bold text-stone-900">Sari-Sari POS</h1>
          <p className="text-sm text-stone-500">Sign in to manage your store</p>
        </div>

        <form
          action={async (formData) => {
            "use server";
            await signIn("credentials", {
              username: formData.get("username"),
              password: formData.get("password"),
              redirectTo: "/",
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600 text-stone-900 bg-stone-50"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-stone-600 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600 text-stone-900 bg-stone-50"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full h-12 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}