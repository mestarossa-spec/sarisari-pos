import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        action={async (formData) => {
          "use server";
          await signIn("credentials", {
            username: formData.get("username"),
            password: formData.get("password"),
            redirectTo: "/",
          });
        }}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border p-6"
      >
        <h1 className="text-xl font-semibold">Sari-Sari POS — Admin Login</h1>
        <input
          name="username"
          placeholder="Username"
          className="rounded border px-3 py-2"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="rounded border px-3 py-2"
          required
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Log in
        </button>
      </form>
    </div>
  );
}