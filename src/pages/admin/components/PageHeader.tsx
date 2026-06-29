import { GoHome, GoPlusCircle, GoSignOut, GoDownload } from "react-icons/go";
import type { GuestInput } from "../../../types/admin";
import { Link } from "react-router-dom";

export function parseCSV(text: string): GuestInput[] {
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
}
export default function PageHeader({
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
          Home
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1 invite-pressable rounded-full border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:border-gray-500 hover:bg-white/5 cursor-pointer"
        >
          <GoSignOut strokeWidth={1} />
        </button>
      </div>
    </div>
  );
}
