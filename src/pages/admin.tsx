import "../App.css";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { GoHome, GoPlusCircle, GoSignOut, GoDownload } from "react-icons/go";
import { GuestTable } from "../components/GuestTable";
const GUESTS_PER_PAGE = 20;

const emptyGuestForm = (): GuestInput => ({
  name: "",
  guest_type: "",
  invitation_code: "",
  is_attending: false,
  message: "",
});

interface FormState {
  isOpen: boolean;
  isEditing: boolean;
  isViewing: boolean;
  editingId: number | null;
}

function AdminPage() {
  // Session state
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Guests data state
  const [guests, setGuests] = useState<GuestAdmin[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [guestsError, setGuestsError] = useState<string | null>(null);

  // Form state
  const [formState, setFormState] = useState<FormState>({
    isOpen: false,
    isEditing: false,
    isViewing: false,
    editingId: null,
  });
  const [form, setForm] = useState<GuestInput>(emptyGuestForm());
  const [saving, setSaving] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Import state
  const [importing, setImporting] = useState(false);

  const loadGuests = useCallback(async () => {
    setGuestsLoading(true);
    setGuestsError(null);
    try {
      const list = await fetchGuests();
      setGuests(list);
      setCurrentPage(1); // Reset to first page when loading
    } catch {
      setGuestsError("Could not load guests.");
    } finally {
      setGuestsLoading(false);
    }
  }, []);

  // Compute paginated guests
  const paginatedGuests = useMemo(() => {
    const start = (currentPage - 1) * GUESTS_PER_PAGE;
    return guests.slice(start, start + GUESTS_PER_PAGE);
  }, [guests, currentPage]);

  const totalPages = Math.ceil(guests.length / GUESTS_PER_PAGE);
  const attendingCount = guests.filter((g) => g.is_attending).length;

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

  // Form management helpers
  const closeForm = () => {
    setFormState({ isOpen: false, isEditing: false, isViewing: false, editingId: null });
    setForm(emptyGuestForm());
  };

  const openCreateForm = () => {
    setForm(emptyGuestForm());
    setFormState({ isOpen: true, isEditing: false, isViewing: false, editingId: null });
  };

  const openEditForm = (guest: GuestAdmin) => {
    setForm({
      name: guest.name,
      guest_type: guest.guest_type,
      invitation_code: guest.invitation_code ?? "",
      is_attending: guest.is_attending,
      message: guest.message,
    });
    setFormState({ isOpen: true, isEditing: true, isViewing: false, editingId: guest.id });
  };

  const openViewForm = (guest: GuestAdmin) => {
    setForm({
      name: guest.name,
      guest_type: guest.guest_type,
      invitation_code: guest.invitation_code ?? "",
      is_attending: guest.is_attending,
      message: guest.message,
    });
    setFormState({ isOpen: true, isEditing: false, isViewing: true, editingId: guest.id });
  };

  // Auth handlers
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
    closeForm();
    setCurrentPage(1);
  };

  // Guest handlers
  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.guest_type.trim()) return;
    setSaving(true);
    setGuestsError(null);
    try {
      if (formState.editingId == null) {
        await createGuestApi({
          ...form,
          invitation_code: form.invitation_code?.trim() || undefined,
        });
      } else {
        await updateGuestApi(formState.editingId, {
          ...form,
          invitation_code: form.invitation_code?.trim() || null,
        });
      }
      closeForm();
      await loadGuests();
    } catch {
      setGuestsError("Could not save guest.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuest = async (id: number) => {
    if (!confirm("Delete this guest?")) return;
    setGuestsError(null);
    try {
      await deleteGuestApi(id);
      await loadGuests();
    } catch {
      setGuestsError("Could not delete guest.");
    }
  };

  // CSV parsing and import
  const parseCSV = (text: string): GuestInput[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header and one data row");
    }

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");
    const typeIdx = headers.indexOf("guest type");
    const codeIdx = headers.indexOf("invitation code");

    if (nameIdx === -1 || typeIdx === -1) {
      throw new Error("CSV must have 'name' and 'guest type' columns");
    }

    // Parse rows
    const guests: GuestInput[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim());
      const name = values[nameIdx];
      const guestType = values[typeIdx];
      const code = codeIdx !== -1 ? values[codeIdx] : "";

      if (!name || !guestType) {
        throw new Error(`Row ${i + 1}: name and guest type are required`);
      }

      guests.push({
        name,
        guest_type: guestType,
        invitation_code: code || undefined,
        is_attending: false,
        message: "",
      });
    }

    if (guests.length === 0) {
      throw new Error("No valid guest data found in CSV");
    }

    return guests;
  };

  const handleImportCSV = async (file: File) => {
    setImporting(true);
    setGuestsError(null);

    try {
      const text = await file.text();
      const guestsToImport = parseCSV(text);

      // Import guests
      let successCount = 0;
      for (const guest of guestsToImport) {
        try {
          await createGuestApi({
            ...guest,
            invitation_code: guest.invitation_code?.trim() || undefined,
          });
          successCount++;
        } catch {
          // Continue importing even if one fails
        }
      }

      if (successCount === 0) {
        setGuestsError("Failed to import any guests");
      } else if (successCount < guestsToImport.length) {
        setGuestsError(
          `Imported ${successCount} of ${guestsToImport.length} guests. Some imports failed.`
        );
      }

      await loadGuests();
    } catch (err) {
      setGuestsError(
        err instanceof Error ? err.message : "Failed to import CSV"
      );
    } finally {
      setImporting(false);
    }
  };

  // Render loading state
  if (checkingSession) {
    return (
      <Shell>
        <p className="text-gray-400 invite-modal-step">Checking session…</p>
      </Shell>
    );
  }

  // Render login page
  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} error={loginError} loading={loginLoading} username={username} password={password} setUsername={setUsername} setPassword={setPassword} />;
  }

  // Render admin dashboard
  return (
    <Shell wide>
      <PageHeader
        onCreateGuest={openCreateForm}
        onLogout={handleLogout}
        onImportCSV={handleImportCSV}
        importing={importing}
      />

      <StatsBar totalGuests={guests.length} attendingGuests={attendingCount} />

      {guestsError && <ErrorAlert message={guestsError} />}

      {formState.isOpen && (
        <GuestForm
          form={form}
          setForm={setForm}
          isViewing={formState.isViewing}
          isEditing={formState.isEditing}
          saving={saving}
          onSubmit={handleSaveGuest}
          onCancel={closeForm}
        />
      )}

      <GuestTable
        guests={paginatedGuests}
        loading={guestsLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onView={openViewForm}
        onEdit={openEditForm}
        onDelete={handleDeleteGuest}
      />
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
// Component: Page Header
// ============================================
function PageHeader({
  onCreateGuest,
  onLogout,
  onImportCSV,
  importing,
}: {
  onCreateGuest: () => void;
  onLogout: () => void;
  onImportCSV: (file: File) => Promise<void>;
  importing: boolean;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void onImportCSV(file);
      // Reset input
      e.target.value = "";
    }
  };

  return (
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
          onClick={onCreateGuest}
          className="flex items-center gap-1 invite-pressable rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400 cursor-pointer"
        >
          <GoPlusCircle strokeWidth={1.5} />
          Add guest
        </button>
        <label className="flex items-center gap-1 invite-pressable rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 cursor-pointer disabled:opacity-60">
          <GoDownload strokeWidth={1.5} />
          {importing ? "Importing…" : "Import CSV"}
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={importing}
            className="hidden"
          />
        </label>
        <Link
          to="/"
          className="flex items-center gap-1 invite-pressable rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:bg-white/5"
        >
          <GoHome strokeWidth={1} />
          Invitation
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1 invite-pressable rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:bg-white/5 cursor-pointer"
        >
          <GoSignOut strokeWidth={1} />
          Sign out
        </button>
      </div>
    </div>
  );
}

// ============================================
// Component: Stats Bar
// ============================================
function StatsBar({
  totalGuests,
  attendingGuests,
}: {
  totalGuests: number;
  attendingGuests: number;
}) {
  return (
    <div className="w-full flex max-w-5xl text-start items-center justify-between mb-4 gap-4">
      <div className="flex-1">
        <p className="text-sm text-gray-400">Total guests</p>
        <p className="text-2xl font-semibold text-white">{totalGuests}</p>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-400">Attending</p>
        <p className="text-2xl font-semibold text-emerald-400">
          {attendingGuests} / {totalGuests}
        </p>
      </div>
    </div>
  );
}

// ============================================
// Component: Error Alert
// ============================================
function ErrorAlert({ message }: { message: string }) {
  return (
    <p className="mb-4 max-w-5xl text-sm text-red-400" role="alert">
      {message}
    </p>
  );
}

// ============================================
// Component: Guest Form
// ============================================
function GuestForm({
  form,
  setForm,
  isViewing,
  isEditing,
  saving,
  onSubmit,
  onCancel,
}: {
  form: GuestInput;
  setForm: (form: GuestInput) => void;
  isViewing: boolean;
  isEditing: boolean;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const title = isViewing ? "View guest" : isEditing ? "Edit guest" : "New guest";
  const isDisabled = isViewing;

  return (
    <form
      onSubmit={onSubmit}
      className="invite-modal-panel invite-stack-in mb-6 w-full max-w-5xl rounded-2xl border border-white/10 bg-slate-900/90 p-6"
    >
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-400">Name</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            disabled={isDisabled}
            className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/25 disabled:opacity-60"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-400">Guest type</span>
          <input
            value={form.guest_type}
            onChange={(e) => setForm({ ...form, guest_type: e.target.value })}
            required
            disabled={isDisabled}
            placeholder="e.g. 18 Candles"
            className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/25 disabled:opacity-60"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-gray-400">Invitation code (optional)</span>
          <input
            value={form.invitation_code ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                invitation_code: e.target.value.toUpperCase(),
              })
            }
            maxLength={6}
            placeholder="Auto-generated if empty"
            className="rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 font-mono uppercase text-white outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/25 disabled:opacity-60"
          />
        </label>

        {isViewing && (
          <>
            <label className="flex items-center gap-2 text-sm sm:pt-6">
              <input
                type="checkbox"
                checked={form.is_attending ?? false}
                disabled
                className="size-4 rounded border-gray-600 opacity-60"
              />
              <span className="text-gray-300">Attending</span>
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="text-gray-400">Message / note</span>
              <textarea
                value={form.message ?? ""}
                disabled
                rows={2}
                className="resize-y rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/25 disabled:opacity-60"
              />
            </label>
          </>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {isViewing ? (
          <button
            type="button"
            onClick={onCancel}
            className="invite-pressable rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 cursor-pointer"
          >
            Close
          </button>
        ) : (
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
              onClick={onCancel}
              className="invite-pressable rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </form>
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
        className={`relative z-10 flex w-full flex-col items-center ${wide ? "max-w-5xl" : "max-w-md"}`}
      >
        {children}
      </div>
    </main>
  );
}

export default AdminPage;
