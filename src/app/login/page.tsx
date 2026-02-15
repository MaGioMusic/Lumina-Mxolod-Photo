import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Authentication is being wired up. For now, use the header account menu or go back.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium"
          >
            Back home
          </Link>
          <Link
            href="/profile"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Profile
          </Link>
        </div>
      </div>
    </main>
  );
}
