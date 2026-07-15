import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

type Mode = "sign-in" | "sign-up" | "magic-link";

export default function AuthPage() {
  const { signInWithPassword, signUpWithPassword, signInWithMagicLink, signInWithGoogle } =
    useAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  async function handleGoogle() {
    setError(null);
    setGoogleBusy(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setGoogleBusy(false);
    }
    // On success the browser navigates away to Google, so no need to reset busy state.
  }

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
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleBusy}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 text-sm font-medium text-neutral-700 dark:text-neutral-200 py-2.5 transition-colors active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.96 10.71A5.41 5.41 0 013.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l3-2.33z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"
              />
            </svg>
            {googleBusy ? "Redirecting…" : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            <span className="text-xs text-neutral-400 dark:text-neutral-500">or</span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

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
