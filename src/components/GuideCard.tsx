import { GoCheck, GoCircleSlash } from "react-icons/go";

export default function GuideCard() {
  return (
    <div className="invite-stack-in-delayed text-start flex flex-col gap-2 rounded-2xl bg-slate-900 p-6 shadow-md backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:shadow-lg">
      <h1 className="text-2xl font-serif font-semibold text-blue-400">
        Event Details
      </h1>
      <p className="text-sm text-gray-500">
        Here are the event guidelines and instructions for Jazz's 18th Debut
        Birthday.
      </p>

      {/* Schedule */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Schedule of the Evening</h2>
        <div className="flex flex-col">
          <div className="flex gap-4 items-start">
            <span className="text-xs font-semibold w-16 shrink-0 pt-0.5">
              5:00 PM
            </span>
            <div className="flex flex-col items-center self-stretch">
              <div className="w-2 h-2 rounded-full bg-gray-500 mt-1.5 shrink-0" />
              <div className="w-px flex-1 bg-gray-700 mt-1" />
            </div>
            <div className="flex flex-col pb-4 pl-2">
              <span className="text-sm font-medium">Doors Open</span>
              <span className="text-xs text-gray-500">
                Arrive 30 minutes before the event starts
              </span>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="text-xs font-semibold w-16 shrink-0 pt-0.5">
              5:30 PM
            </span>
            <div className="flex flex-col items-center self-stretch">
              <div className="w-2 h-2 rounded-full bg-gray-500 mt-1.5 shrink-0" />
              <div className="w-px flex-1 bg-gray-700 mt-1" />
            </div>
            <div className="flex flex-col pb-4 pl-2">
              <span className="text-sm font-medium">Celebration Begins</span>
              <span className="text-xs text-gray-500">
                The program commences 
              </span>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="text-xs font-semibold w-16 shrink-0 pt-0.5">
              10:00 PM
            </span>
            <div className="flex flex-col items-center self-stretch">
              <div className="w-2 h-2 rounded-full bg-gray-500 mt-1.5 shrink-0" />
            </div>
            <div className="flex flex-col pl-2">
              <span className="text-sm font-medium">End of the Evening</span>
              <span className="text-xs text-gray-500">
                Thank you for celebrating with us
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Venue */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-serif font-semibold text-blue-400">
          Venue
        </h1>
        <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-slate-800 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-700 bg-slate-700 text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Steelworld Tower</span>
            <a
              className="text-xs text-sky-400 decoration-sky-400/40 underline-offset-2 transition-colors duration-200 hover:text-sky-300"
              href="https://www.google.com/maps/place/Steelworld+Tower/data=!4m2!3m1!1s0x0:0x87b8da959fe13123?sa=X&ved=1t:2428&ictx=111"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* Attire */}
      <div className="flex flex-col gap-2 mt-4">
        <h1 className="text-2xl font-serif font-semibold text-blue-400">
          Attire
        </h1>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1 rounded-lg border border-gray-800 bg-slate-800 p-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Encouraged
            </span>
            {[
              "Elegant wear",
              "Formal attire",
              "Your very best look",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-xs text-gray-300"
              >
                <span className="text-green-500"><GoCheck /></span> {item}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-gray-800 bg-slate-800 p-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Please Avoid
            </span>
            {["Shorts", "Sandals", "Overly casual wear"].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-xs text-gray-300"
              >
                <span className="text-red-400">✕</span> {item}
              </div>
            ))}
          </div>
        </div>
        <span className="flex flex-col mt-2">
          <h1 className="text-lg font-bold">Recommended Attire Color</h1>
        
        </span>
        <div className="flex gap-2 items-center">
          <span className="text-green-500">
            <GoCheck />
          </span>

          <div className="bg-[#5A86AD] w-8 h-8 rounded-full"></div>
          <div className="bg-[#F7E7CE] w-8 h-8 rounded-full"></div>
          <div className="bg-[#D3D3D3] w-8 h-8 rounded-full"></div>
        </div>
          <p className="text-xs text-gray-400">
          For consistency, we encourage you to wear attire in the following colors.
          </p>
        
        <h1 className="text-lg font-bold">Please Avoid Wearing</h1>
        <div className="flex gap-2 items-center">
          <span className="text-red-400">
            <GoCircleSlash />
          </span>
          <div className="bg-neutral-950 w-8 h-8 rounded-full ring-2 ring-neutral-500"></div>
          <div className="bg-[#0C1F45] w-8 h-8 rounded-full ring-2 ring-neutral-500"></div>
        </div>
        <p className="text-xs text-gray-400">
          In honor, of the celebrant, we kindly request that guests refrain
          from wearing the following colors:
        </p>

        <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-slate-800 p-3 mt-4">
          <p className="text-xs text-center">
            As much as we would love to accommodate everyone, our venue has
            limited capacity. We kindly request that{" "}
            <span className="font-bold text-blue-300">
              only those included in the invitation
            </span>{" "}
            attend. Thank you for understanding!
          </p>
        </div>
      </div>
    </div>
  );
}
