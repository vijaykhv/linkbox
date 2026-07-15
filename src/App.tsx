import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import AuthPage from "./pages/AuthPage";
import AppShell from "./pages/AppShell";
import QuickSave from "./pages/QuickSave";
import SharedCollectionPage from "./pages/SharedCollectionPage";

// "save" is set by the bookmarklet/iOS Shortcut, which build the URL directly.
// Android's Web Share Target instead navigates like a GET form submission,
// which replaces the whole query string with just its mapped fields — so
// "save" never survives that trip. "url"/"text" cover that case.
const quickSaveParams = new URLSearchParams(window.location.search);
const isQuickSave =
  quickSaveParams.has("save") || quickSaveParams.has("url") || quickSaveParams.has("text");

// Public share links (?shared=<token>) render with no auth requirement at all.
const sharedToken = new URLSearchParams(window.location.search).get("shared");

function Spinner() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-cream-100 dark:bg-ink-950">
      <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );
}

function Gate() {
  const { session, loading } = useAuth();
  if (loading) return <Spinner />;
  return session ? <AppShell /> : <AuthPage />;
}

function QuickSaveGate() {
  const { session, loading } = useAuth();
  if (loading) return <Spinner />;
  return session ? <QuickSave /> : <AuthPage />;
}

export default function App() {
  if (sharedToken) {
    return (
      <ThemeProvider>
        <SharedCollectionPage token={sharedToken} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>{isQuickSave ? <QuickSaveGate /> : <Gate />}</AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
