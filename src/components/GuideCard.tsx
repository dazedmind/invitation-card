export default function GuideCard() {
  return (
    <div className="invite-stack-in-delayed text-start flex flex-col gap-2 rounded-lg border border-gray-800 bg-slate-900 p-6 shadow-md backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-gray-700 hover:shadow-lg">
      <h1 className="text-2xl font-bold">Event Guide</h1>
      <p className="text-sm text-gray-500">
        Here are the event guidelines and instructions.
      </p>

      <div>
        <h2 className="text-lg font-bold">Arrival</h2>
        <ul className="flex flex-col gap-2 text-sm list-inside list-disc">
          <li>Arrive at the venue 30 minutes before the event starts.</li>
          <li>The event will start at 6:00 PM.</li>
          <li>The event will end at 10:00 PM.</li>
          <li>
            The event will be held at{" "}
            <a
              className="text-sky-400 underline decoration-sky-400/40 underline-offset-2 transition-colors duration-200 hover:text-sky-300"
              href="https://www.google.com/maps/place/400+N+La+Salle+St,+Chicago,+IL+60654/@41.882554,-87.6231908,17z/data=!3m1!4b1!4m6!3m5!1s0x880e2c6258fc7937:0xde8c99ad00380d40!8m2!3d41.882554!4d-87.6206159!16s%2Fg%2F11c4022qbz?entry=ttu&g_ep=EgoyMDI2MDIxMi4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
            >
              Philam Homes Clubhouse
            </a>
            .
          </li>
          <li>Your presence is greatly appreciated in this magical event</li>
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-bold">Attire</h2>
        <ul className="flex flex-col gap-2 text-sm list-inside list-disc">
          <li>Dress code is casual and elegant.</li>
          <li>No shorts or sandals.</li>
          <li>Wear your best outfit!</li>
        </ul>
      </div>
    </div>
  );
}
