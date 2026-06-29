import { useCallback, useEffect, useMemo, useState } from "react";
import type { GuestAdmin } from "../../../types/admin";
import PageHeader, { parseCSV } from "../components/PageHeader";
import {
  clearAdminToken,
  createGuestApi,
  deleteGuestApi,
  fetchGuests,
  getAdminToken,
  verifyAdminSession,
} from "../../../lib/adminApi";
import { GuestTable } from "../../../components/GuestTable";
import GuestForm from "../components/GuestForm";
import { toast } from "sonner";

const GUESTS_PER_PAGE = 20;

interface FormState {
  isOpen: boolean;
  isEditing: boolean;
  isViewing: boolean;
  activeGuest: GuestAdmin | null; // 💡 Track the object instead of editingId
}
export default function AdminDashboard() {
  // Session state
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  // Guests data state
  const [guests, setGuests] = useState<GuestAdmin[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);

  const [filterType, setFilterType] = useState<string>("all"); // 👈 Add this line

  // Form state
  const [formState, setFormState] = useState<FormState>({
    isOpen: false,
    isEditing: false,
    isViewing: false,
    activeGuest: null,
  });
    
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Import state
  const [importing, setImporting] = useState(false);

  const loadGuests = useCallback(async () => {
    setGuestsLoading(true);
    try {
      const list = await fetchGuests();
      setGuests(list);
      setCurrentPage(1); // Reset to first page when loading
    } catch {
      toast.error("Could not load guests.");
    } finally {
      setGuestsLoading(false);
    }
  }, []);

  const filteredGuests = useMemo(() => {
    if (filterType === "all") return guests;

    return guests.filter((guest) => {
      if (filterType === "attending") return guest.is_attending;
      if (filterType === "not-attending") return !guest.is_attending;
      
      // Fallback: Check if guest_type matches strings like '18-roses', '18-candles', etc.
      // Adjust casing conversion if your database stores them differently (e.g., "18 Roses")
      return guest.guest_type.toLowerCase().replace(/\s+/g, "-") === filterType;
    });
  }, [guests, filterType]);

  const paginatedGuests = useMemo(() => {
    const start = (currentPage - 1) * GUESTS_PER_PAGE;
    return filteredGuests.slice(start, start + GUESTS_PER_PAGE); // 💡 Fixed: slicing filteredGuests
  }, [filteredGuests, currentPage]);

  const totalPages = Math.ceil(filteredGuests.length / GUESTS_PER_PAGE);
  const attendingCount = guests.filter((g) => g.is_attending).length; 
  const totalGuests = guests.length;

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setCurrentPage(1); // Crucial: Reset back to page 1 when filtering
  };

  const handleLogout = () => {
    clearAdminToken();
    setLoggedIn(false);
    setGuests([]);
    setCurrentPage(1);
  };

  {loggedIn}

    const openCreateForm = () => {
    setFormState({ isOpen: true, isEditing: false, isViewing: false, activeGuest: null });
  };
  
  const openEditForm = (guest: GuestAdmin) => {
    setFormState({ isOpen: true, isEditing: true, isViewing: false, activeGuest: guest });
  };
  
  const openViewForm = (guest: GuestAdmin) => {
    setFormState({ isOpen: true, isEditing: false, isViewing: true, activeGuest: guest });
  };

  const handleCloseForm = () => {
    setFormState({ isOpen: false, isEditing: false, isViewing: false, activeGuest: null });
  };

  const handleSaveSuccess = async () => {
    handleCloseForm();
    await loadGuests(); // Reload table data after child handles the submission API
  };

  const handleDeleteGuest = async (id: number) => {
    if (!confirm("Delete this guest?")) return;
    try {
      await deleteGuestApi(id);
      await loadGuests();
    } catch {
      toast.error("Could not delete guest.");
    }
  };

  const handleImportCSV = async (file: File) => {
    setImporting(true);

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
        toast.error("Failed to import any guests");
      } else if (successCount < guestsToImport.length) {
        toast.error(
          `Imported ${successCount} of ${guestsToImport.length} guests. Some imports failed.`,
        );
      }

      await loadGuests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import CSV");
    } finally {
      setImporting(false);
    }
  };

  // Render loading state
  if (checkingSession) {
    return (
      <div>
        <p className="text-gray-400 invite-modal-step">Checking session…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <PageHeader
        onCreateGuest={openCreateForm}
        onLogout={handleLogout}
        onImportCSV={handleImportCSV}
        importing={importing}
      />

      <div className="w-full flex max-w-5xl text-start items-center justify-between mb-4 gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-400">Total Guests Invited</p>
          <p className="text-2xl font-semibold text-white">{totalGuests}</p>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400">Total Guests Attending</p>
          <span className="flex items-center gap-1">
            <p className="text-2xl font-semibold text-emerald-400">
              {attendingCount}
            </p>
            <p className="text-2xl text-gray-400">
              / {totalGuests}
            </p>
          </span>
        </div>
        
        {/* FILTER */}
        <div className="relative w-42">
          <select value={filterType} onChange={handleFilterChange} className="block w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-8 text-sm font-medium text-gray-400 shadow-sm transition ease-in-out focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option disabled selected hidden>Select an option</option>
            <option value="all">Sort by</option>
            <option value="attending">Attending</option>
            <option value="not-attending">Not attending</option>
            <option value="18-roses">18 Roses</option>
            <option value="18-bills">18 Bills</option>
            <option value="18-gifts">18 Gifts</option>
            <option value="18-candles">18 Candles</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {formState.isOpen && (
        <GuestForm
          isViewing={formState.isViewing}
          isEditing={formState.isEditing}
          guest={formState.activeGuest}
          onSaveSuccess={handleSaveSuccess}
          onCancel={handleCloseForm}
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
    </div>
  );
}
