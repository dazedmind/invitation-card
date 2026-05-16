import "../App.css";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StarryBackground from "../components/StarryBackground";
import type { GuestAdmin, GuestInput } from "../types/admin";
import {
  clearAdminToken,
  createGuestApi,
  deleteGuestApi,
  fetchGuests,
  getAdminToken,
  loginAdmin,
  updateGuestApi,
  verifyAdminSession,
} from "../lib/adminApi";
import { GoHome, GoPlusCircle, GoSignOut } from "react-icons/go";

const emptyGuestForm = (): GuestInput => ({
  name: "",
  guest_type: "",
  invitation_code: "",
  is_attending: false,
  message: "",
});

function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [guests, setGuests] = useState<GuestAdmin[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [guestsError, setGuestsError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [form, setForm] = useState<GuestInput>(emptyGuestForm);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadGuests = useCallback(async () => {
    setGuestsLoading(true);
    setGuestsError(null);
    try {
      const list = await fetchGuests();
      setGuests(list);
    } catch {
      setGuestsError("Could not load guests.");
    } finally {
      setGuestsLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      if (!getAdminToken()) {
        setCheckingSession(false);
        return;
      }
      const ok = await verifyAdminSession();
      setLoggedIn(ok);
      setCheckingSession(false);
      if (ok) await loadGuests();
    })();
  }, [loadGuests]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      await loginAdmin(username, password);
      setLoggedIn(true);
      setPassword("");
      await loadGuests();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setLoggedIn(false);
    setGuests([]);
    setFormOpen(false);
    setEditingId(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setViewingId(null); // ← Add this
    setForm(emptyGuestForm());
    setFormOpen(true);
  };

  const openEdit = (guest: GuestAdmin) => {
    setEditingId(guest.id);
    setViewingId(null);
    setForm({
      name: guest.name,
      guest_type: guest.guest_type,
      invitation_code: guest.invitation_code ?? "",
      is_attending: guest.is_attending,
      message: guest.message,
    });
    setFormOpen(true);
  };

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.guest_type.trim()) return;
    setSaving(true);
    setGuestsError(null);
    try {
      if (editingId == null) {
        await createGuestApi({
          ...form,
          invitation_code: form.invitation_code?.trim() || undefined,
        });
      } else {
        await updateGuestApi(editingId, {
          ...form,
          invitation_code: form.invitation_code?.trim() || null,
        });
      }
      setFormOpen(false);
      setEditingId(null);
      setViewingId(null);
      await loadGuests();
    } catch {
      setGuestsError("Could not save guest.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this guest?")) return;
    setGuestsError(null);
    try {
      await deleteGuestApi(id);
      await loadGuests();
    } catch {
      setGuestsError("Could not delete guest.");
    }
  };

  const handleView = (guest: GuestAdmin) => {
    setViewingId(guest.id);
    setEditingId(null); // ← Add this
    setForm({
      name: guest.name,
      guest_type: guest.guest_type,
      invitation_code: guest.invitation_code ?? "",
      is_attending: guest.is_attending,
      message: guest.message,
    });
    setFormOpen(true);
  };

  if (checkingSession) {
    return (
      <Shell>
        <p className="text-gray-400 invite-modal-step">Checking session…</p>
      </Shell>
    );
  }

  if (!loggedIn) {
    return (
      <Shell className="justify-center">
        <div className="invite-stack-in w-full max-w-md flex flex-col justify-center align-middle">
          <h1 className="text-center text-5xl font-bold font-cursive">
            Event Master
          </h1>
          <p className="text-center italic text-gray-400">
            Sign in to manage guest list
          </p>
          <form
            onSubmit={(e) => void handleLogin(e)}
            className="mt-4 flex flex-col gap-3"
          >
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
            {loginError ? (
              <p className="text-sm text-red-400" role="alert">
                {loginError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loginLoading}
              className="invite-pressable w-full rounded-full bg-blue-500 py-3 font-medium text-white cursor-pointer hover:bg-blue-400 disabled:opacity-60"
            >
              {loginLoading ? "Signing in…" : "Sign in"}
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

  return (
    <Shell wide>
      <div className="invite-stack-in mb-6 flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold font-cursive sm:text-5xl">
            Guest list
          </h1>
          <p className="text-gray-400">Manage invitations and RSVP status</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-1 invite-pressable rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400 cursor-pointer"
          >
            <GoPlusCircle strokeWidth={1.5} />
            Add guest
          </button>
          <Link
            to="/"
            className="flex items-center gap-1 invite-pressable rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:bg-white/5"
          >
            <GoHome strokeWidth={1} />
            Invitation
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 invite-pressable rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:bg-white/5 cursor-pointer"
          >
            <GoSignOut strokeWidth={1} />
            Sign out
          </button>
        </div>
      </div>

      {guestsError ? (
        <p className="mb-4 max-w-5xl text-sm text-red-400" role="alert">
          {guestsError}
        </p>
      ) : null}

      {formOpen ? (
        <form
          onSubmit={(e) => void handleSaveGuest(e)}
          className="invite-modal-panel invite-stack-in mb-6 w-full max-w-5xl rounded-2xl border border-white/10 bg-slate-900/90 p-6"
        >
          <h2 className="mb-4 text-lg font-semibold">
            {viewingId != null
              ? "View guest"
              : editingId != null
                ? "Edit guest"
                : "New guest"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-400">Name</span>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/25"
                disabled={viewingId != null} // ← Fixed
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-400">Guest type</span>
              <input
                value={form.guest_type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, guest_type: e.target.value }))
                }
                required
                placeholder="e.g. 18 Candles"
                className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/25"
                disabled={viewingId != null} // ← Fixed (was "!null" which is always true)
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-gray-400">Invitation code (optional)</span>
              <input
                value={form.invitation_code ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    invitation_code: e.target.value.toUpperCase(),
                  }))
                }
                maxLength={6}
                placeholder="Auto-generated if empty"
                className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 font-mono uppercase text-white outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/25"
                disabled={viewingId != null || editingId != null} // ← Fixed: disable for both view and edit
              />
            </label>
            <label className="flex items-center gap-2 text-sm sm:pt-6">
              <input
                type="checkbox"
                checked={form.is_attending ?? false}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_attending: e.target.checked }))
                }
                className="size-4 rounded border-gray-600"
                disabled={viewingId != null} // ← Fixed
              />
              <span className="text-gray-300">Attending</span>
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="text-gray-400">Message / note</span>
              <textarea
                value={form.message ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                rows={2}
                className="resize-y rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/25"
                disabled={viewingId != null} // ← Fixed (was "!editingId")
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            {viewingId != null ? (
              // View mode: only show Close button
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setViewingId(null);
                }}
                className="invite-pressable rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 cursor-pointer"
              >
                Close
              </button>
            ) : (
              // Edit/Create mode: show Save and Cancel
              <>
                <button
                  type="submit"
                  disabled={saving}
                  className="invite-pressable rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400 disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingId(null);
                    setViewingId(null);
                  }}
                  className="invite-pressable rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      ) : null}

      <div className="invite-stack-in-delayed w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl backdrop-blur-sm">
        {guestsLoading ? (
          <p className="p-8 text-center text-gray-400">Loading guests…</p>
        ) : guests.length === 0 ? (
          <p className="p-8 text-center text-gray-400">No guests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">RSVP</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr
                    key={g.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <code className="rounded bg-black/40 px-2 py-0.5 font-mono text-sky-300">
                        {g.invitation_code ?? "—"}
                      </code>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      {g.name}
                    </td>

                    <td className="px-4 py-3 text-gray-300">{g.guest_type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          g.is_attending ? "text-emerald-400" : "text-gray-500"
                        }
                      >
                        {g.is_attending ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-gray-400">
                      {g.message || "—"}
                    </td>
                    <td className="flex items-center justify-center px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleView(g)}
                        className=" text-xs bg-purple-500/10 p-1 px-2 rounded-full invite-pressable mr-2 text-purple-400 hover:text-purple-300 cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(g)}
                        className=" text-xs bg-blue-500/10 p-1 px-2 rounded-full invite-pressable mr-2 text-sky-400 hover:text-sky-300 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(g.id)}
                        className="text-xs bg-rose-500/10 p-1 px-2 rounded-full invite-pressable text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}

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
        className={`relative z-10 flex w-full flex-col items-center ${wide ? "max-w-5xl" : "max-w-md"}`}
      >
        {children}
      </div>
    </main>
  );
}

export default AdminPage;
