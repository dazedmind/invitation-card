import { useState, useEffect } from "react";
import type { GuestAdmin, GuestInput } from "../../../types/admin";
import { updateGuestApi, createGuestApi } from "../../../lib/adminApi";
import { toast } from 'sonner';

const emptyGuestForm = (): GuestInput => ({
  name: "",
  guest_type: "",
  invitation_code: "",
  is_attending: false,
  message: "",
});

interface GuestFormProps {
  isViewing: boolean;
  isEditing: boolean;
  guest: GuestAdmin | null;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export default function GuestForm({
  isViewing,
  isEditing,
  guest,
  onSaveSuccess,
  onCancel,
}: GuestFormProps) {
  const title = isViewing ? "Guest Information" : isEditing ? "Edit Guest Details" : "Add New Guest";
  const isDisabled = isViewing;

  const [form, setForm] = useState<GuestInput>(emptyGuestForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (guest && (isEditing || isViewing)) {
      setForm({
        name: guest.name,
        guest_type: guest.guest_type,
        invitation_code: guest.invitation_code ?? "",
        is_attending: guest.is_attending,
        message: guest.message || "",
      });
    } else {
      setForm(emptyGuestForm());
    }
  }, [guest, isEditing, isViewing]);

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.guest_type.trim()) return;
    
    setSaving(true);
    try {
      if (!isEditing || !guest) {
        await createGuestApi({
          ...form,
          invitation_code: form.invitation_code?.trim() || undefined,
        });
      } else {
        await updateGuestApi(guest.id, {
          ...form,
          invitation_code: form.invitation_code?.trim() || null,
        });
      }
      toast.success("Guest record saved.");
      onSaveSuccess();
    } catch {
      toast.error("Could not save guest.");
    } finally {
      setSaving(false);
    }
  };

  return (
    // 1. Fixed Overlay (Dims the entire screen background)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-300">
      
      {/* 2. Modal Card Container */}
      <form
        onSubmit={handleSaveGuest}
        className="w-full max-w-2xl transform overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-6 text-start shadow-2xl transition-all duration-300 invite-stack-in"
      >
        {/* Header Layout */}
        <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
        </div>

        {/* Inputs Grid Layout */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-gray-300">Full Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                disabled={isDisabled}
                placeholder="Enter guest's complete name"
                className="rounded-xl border border-gray-700 bg-gray-800/50 px-3.5 py-2.5 text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-gray-300">Guest Type</span>
              <input
                value={form.guest_type}
                onChange={(e) => setForm({ ...form, guest_type: e.target.value })}
                required
                disabled={isDisabled}
                placeholder="e.g. 18 Roses, 18 Candles, VIP"
                className="rounded-xl border border-gray-700 bg-gray-800/50 px-3.5 py-2.5 text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 items-end">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-gray-300">Invitation Code (Optional)</span>
              <input
                value={form.invitation_code ?? ""}
                onChange={(e) => setForm({ ...form, invitation_code: e.target.value.toUpperCase() })}
                maxLength={6}
                disabled={isDisabled}
                placeholder="Auto-generates if empty"
                className="rounded-xl border border-gray-700 bg-gray-800/50 px-3.5 py-2.5 font-mono uppercase text-indigo-400 placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition"
              />
            </label>

            {(isViewing || isEditing) && (
              <label className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-800/20 px-4 py-3 text-sm cursor-pointer hover:bg-gray-800/30 transition">
                <input
                  type="checkbox"
                  checked={form.is_attending ?? false}
                  disabled={isDisabled}
                  onChange={(e) => setForm({ ...form, is_attending: e.target.checked })}
                  className={`h-4 w-4 rounded border-green-600 bg-green-500 text-indigo-500 ${isDisabled ? "bg-green-400":""} focus:ring-indigo-500/30 accent-indigo-500 disabled:opacity-50`}
                /> 
                <div className="flex flex-col">
                  <span className="font-medium text-white">Attendance Confirmed</span>
                </div>
              </label>
            )}
          </div>

          {/* 🌟 Meaningful Redesigned Message Field */}
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="text-sm font-semibold text-gray-200">Message</span>
            </div>
    
            <textarea
              value={form.message ?? ""}
              disabled={isDisabled}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={8}
              placeholder={isDisabled ? "No messages left by this guest." : "Type dietary restrictions, congenital preferences, or wishes here..."}
              className="w-full mt-1 rounded-xl border border-gray-700 bg-gray-800/40 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 transition resize-none"
            />
          </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
          {isViewing ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl bg-gray-800 px-5 py-2 text-sm font-medium text-gray-200 hover:bg-gray-700 transition cursor-pointer"
            >
              Close
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-gray-700 px-5 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 disabled:opacity-50 transition cursor-pointer"
              >
                {saving ? "Saving Changes…" : "Save Record"}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}