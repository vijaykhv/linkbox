import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

type Mode = "sign-in" | "sign-up" | "magic-link";

export default function AuthPage() {
  const { signInWithPassword, signUpWithPassword, signInWithMagicLink } = useAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      if (mode === "sign-in") {
        const { error } = await signInWithPassword(email, password);
        if (error) setError(error);
      } else if (mode === "sign-up") {
        const { error } = await signUpWithPassword(email, password);
        if (error) setError(error);
        else setMessage("Check your inbox to confirm your email, then sign in.");
      } else {
        const { error } = await signInWithMagicLink(email);
        if (error) setError(error);
        else setMessage("Magic link sent — check your inbox.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-svh flex items-center justify-center px-4 bg-gradient-to-b from-violet-50 to-white dark:from-neutral-950 dark:to-neutral-950">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white text-2xl font-semibold shadow-lg shadow-violet-600/20 mb-4">
            L
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Linkbox
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Your links, saved and synced everywhere.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl shadow-neutral-900/5 border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex gap-1 mb-5 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            {(["sign-in", "sign-up", "magic-link"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setMessage(null);
                }}
                className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${
                  mode === m
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {m === "sign-in" ? "Sign in" : m === "sign-up" ? "Sign up" : "Magic link"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
              />
            </div>

            {mode !== "magic-link" && (
              <div>
                <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-[0.98] disabled:opacity-50 text-white text-sm font-medium py-2.5 transition-all shadow-lg shadow-violet-600/20"
            >
              {busy
                ? "Please wait…"
                : mode === "sign-in"
                  ? "Sign in"
                  : mode === "sign-up"
                    ? "Create account"
                    : "Send magic link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
