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
    <div className="min-h-svh flex items-center justify-center px-4 bg-cream-100 dark:bg-ink-950">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500 text-white text-2xl font-extrabold mb-4 pop-border pop-shadow">
            L
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-950 dark:text-cream-50">
            Linkbox
          </h1>
          <p className="text-ink-950/50 dark:text-cream-100/50 mt-1.5 text-sm font-medium">
            Your links, saved and synced everywhere.
          </p>
        </div>

        <div className="bg-white dark:bg-ink-900 rounded-2xl p-6 pop-border pop-shadow">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleBusy}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-white dark:bg-ink-800 disabled:opacity-50 text-sm font-bold text-ink-950 dark:text-cream-50 py-2.5 pop-border pop-shadow-sm pop-press"
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
            <div className="h-px flex-1 bg-cream-300 dark:bg-ink-800" />
            <span className="text-xs font-bold text-ink-950/30 dark:text-cream-100/30">or</span>
            <div className="h-px flex-1 bg-cream-300 dark:bg-ink-800" />
          </div>

          <div className="flex gap-1 mb-5 bg-cream-100 dark:bg-ink-800 rounded-xl p-1 pop-border">
            {(["sign-in", "sign-up", "magic-link"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setMessage(null);
                }}
                className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${
                  mode === m
                    ? "bg-amber-300 text-ink-950 pop-border pop-shadow-sm"
                    : "text-ink-950/50 dark:text-cream-100/50"
                }`}
              >
                {m === "sign-in" ? "Sign in" : m === "sign-up" ? "Sign up" : "Magic link"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-ink-950/60 dark:text-cream-100/60 mb-1 block">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl bg-cream-100 dark:bg-ink-800 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400 pop-border"
              />
            </div>

            {mode !== "magic-link" && (
              <div>
                <label className="text-xs font-bold text-ink-950/60 dark:text-cream-100/60 mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-cream-100 dark:bg-ink-800 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400 pop-border"
                />
              </div>
            )}

            {error && (
              <p className="text-sm font-medium text-red-700 bg-red-100 rounded-lg px-3 py-2 pop-border">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm font-medium text-emerald-800 bg-emerald-100 rounded-lg px-3 py-2 pop-border">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-violet-500 disabled:opacity-50 text-white text-sm font-bold py-2.5 pop-border pop-shadow pop-press"
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
