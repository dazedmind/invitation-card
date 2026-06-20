import "../App.css";
import type { GuestAdmin } from "../types/admin";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";

// ============================================
// Component: Guest Table with Pagination
// ============================================
export function GuestTable({
  guests,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: {
  guests: GuestAdmin[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (guest: GuestAdmin) => void;
  onEdit: (guest: GuestAdmin) => void;
  onDelete: (id: number) => void;
}) {
  if (loading) {
    return (
      <div className="invite-stack-in-delayed w-full max-w-5xl p-8 text-center text-gray-400">
        Loading guests…
      </div>
    );
  }

  if (guests.length === 0) {
    return (
      <div className="invite-stack-in-delayed w-full max-w-5xl p-8 text-center text-gray-400">
        No guests yet.
      </div>
    );
  }

  return (
    <div className="invite-stack-in-delayed w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-left text-sm">
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
                <td className="px-4 py-3 font-medium text-white">{g.name}</td>
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
                <td className="flex items-center gap-1 px-4 py-3">
                  <ActionButton
                    label="View"
                    onClick={() => onView(g)}
                    variant="purple"
                  />
                  <ActionButton
                    label="Edit"
                    onClick={() => onEdit(g)}
                    variant="blue"
                  />
                  <ActionButton
                    label="Delete"
                    onClick={() => onDelete(g.id)}
                    variant="red"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => onPageChange(currentPage - 1)}
          onNext={() => onPageChange(currentPage + 1)}
        />
      )}
    </div>
  );
}

// ============================================
// Component: Action Button
// ============================================
function ActionButton({
  label,
  onClick,
  variant,
}: {
  label: string;
  onClick: () => void;
  variant: "purple" | "blue" | "red";
}) {
  const variantClasses = {
    purple: "bg-purple-500/10 text-purple-400 hover:text-purple-300",
    blue: "bg-blue-500/10 text-sky-400 hover:text-sky-300",
    red: "bg-rose-500/10 text-rose-400 hover:text-rose-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs p-1 px-2 rounded-full invite-pressable cursor-pointer ${variantClasses[variant]}`}
    >
      {label}
    </button>
  );
}

// ============================================
// Component: Pagination Controls
// ============================================
function PaginationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-4 border-t border-white/10 px-4 py-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentPage === 1}
        className="flex items-center gap-1 invite-pressable rounded-full border border-gray-600 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <GoChevronLeft strokeWidth={1} />
        Previous
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">
          Page <span className="font-semibold text-white">{currentPage}</span> of{" "}
          <span className="font-semibold text-white">{totalPages}</span>
        </span>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 invite-pressable rounded-full border border-gray-600 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        Next
        <GoChevronRight strokeWidth={1} />
      </button>
    </div>
  );
}