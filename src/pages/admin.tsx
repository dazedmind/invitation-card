import "../App.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  loginAdmin,
} from "../lib/adminApi";
import StarryBackground from "../components/StarryBackground";
import AdminDashboard from "./admin/components/Dashboard";


function AdminPage() {
  // Session state
  const [loggedIn, setLoggedIn] = useState(false);

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Auth handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      await loginAdmin(username, password);
      setLoggedIn(true);
      setPassword("");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  // Render login page
  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} error={loginError} loading={loginLoading} username={username} password={password} setUsername={setUsername} setPassword={setPassword} />;
  }

  // Render admin dashboard
  return (
    <Shell wide>
      <AdminDashboard />
    </Shell>
  );
}

// ============================================
// Component: Login Page
// ============================================
function LoginPage({
  onLogin,
  error,
  loading,
  username,
  password,
  setUsername,
  setPassword,
}: {
  onLogin: (e: React.FormEvent) => void;
  error: string | null;
  loading: boolean;
  username: string;
  password: string;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
}) {
  return (
    <Shell className="justify-center">
      <div className="invite-stack-in w-full max-w-md flex flex-col justify-center">
        <h1 className="text-center text-5xl font-bold font-cursive">
          Event Master
        </h1>
        <p className="text-center italic text-gray-400">
          Sign in to manage guest list
        </p>
        <form onSubmit={onLogin} className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            className="w-full rounded-full border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-gray-500 focus:border-sky-500/40"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-full border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-gray-500 focus:border-sky-500/40"
          />
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="invite-pressable w-full rounded-full bg-blue-500 py-3 font-medium text-white cursor-pointer hover:bg-blue-400 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <Link
          to="/"
          className="mt-6 block text-center text-sm text-gray-500 transition-colors hover:text-gray-300"
        >
          Back to invitation
        </Link>
      </div>
    </Shell>
  );
}

// ============================================
// Component: Shell Layout
// ============================================
function Shell({
  children,
  wide = false,
  className,
}: {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <main
      className={`relative flex min-h-screen flex-col items-center overflow-y-auto bg-linear-to-b from-slate-950 to-gray-900 px-4 py-10 text-white ${className}`}
    >
      <StarryBackground />
      <div
        className={`relative z-10 flex w-full flex-col items-center ${wide ? "max-w-full" : "max-w-md"}`}
      >
        {children}
      </div>
    </main>
  );
}


export default AdminPage;
