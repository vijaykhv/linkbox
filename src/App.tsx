import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import AuthPage from "./pages/AuthPage";
import AppShell from "./pages/AppShell";
import QuickSave from "./pages/QuickSave";

const isQuickSave = new URLSearchParams(window.location.search).has("save");

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
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>{isQuickSave ? <QuickSaveGate /> : <Gate />}</AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
