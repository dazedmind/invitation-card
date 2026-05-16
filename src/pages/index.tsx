import "../App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import SlideToOpen from "../components/SliderButton";
import InvitationCard from "../components/InvitationCard";
import GuideCard from "../components/GuideCard";
import type { GuestPublic } from "../types/guest";
import FallingSnow from "../components/SnowFall";
import BlurText from "../components/BlurText";
import BackgroundMusic from "../components/BackgroundMusic";
import { GoSync } from "react-icons/go";

function starProps(seed: number) {
  const r = (n: number) => {
    const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    left: `${r(1) * 100}%`,
    top: `${r(2) * 100}%`,
    size: r(3) * 2 + 0.5,
    duration: 2 + r(4) * 4,
    delay: r(5) * 6,
    blur: r(6) > 0.85,
  };
}

function HomePage() {
  const [opened, setOpened] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");
  const [guest, setGuest] = useState<GuestPublic | null>(null);
  const [inviteLookupError, setInviteLookupError] = useState<string | null>(
    null,
  );
  const invitationCardRef = useRef<HTMLDivElement>(null);

  const hasInvitationCode = invitationCode.trim().length === 6;

  const stars = useMemo(
    () =>
      Array.from({ length: 140 }, (_, i) => ({
        id: i,
        ...starProps(i + 1),
      })),
    [],
  );

  useEffect(() => {
    if (opened) {
      invitationCardRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [opened]);

  const handleSlideOpen = useCallback(async () => {
    setInviteLookupError(null);
    const code = invitationCode.trim().toUpperCase();
    try {
      const res = await fetch(`/api/guest?code=${encodeURIComponent(code)}`);
      if (res.status === 404) {
        setInviteLookupError("Invitation code does not exist");
        setGuest(null);
        return false;
      }
      if (!res.ok) {
        setInviteLookupError(
          "Unable to verify the invitation code. Try again.",
        );
        setGuest(null);
        return false;
      }
      const data = (await res.json()) as { guest: GuestPublic };
      setGuest(data.guest);
      setOpened(true);
      return true;
    } catch {
      setInviteLookupError("Unable to verify the invitation code. Try again.");
      setGuest(null);
      return false;
    }
  }, [invitationCode]);

  const handleRSVP = useCallback(
    async (message: string) => {
      const id = guest?.id;
      if (id == null) return;
      const res = await fetch("/api/guest/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          is_attending: true,
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to update guest");
      setGuest((g) =>
        g ? { ...g, is_attending: true, message: message.trim() } : g,
      );
    },
    [guest?.id],
  );

  const handleCantGo = useCallback(
    async (reason: string) => {
      const id = guest?.id;
      if (id == null) return;
      const message = `[Can't attend] ${reason.trim()}`;
      const res = await fetch("/api/guest/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          is_attending: false,
          message,
        }),
      });
      if (!res.ok) throw new Error("Failed to update guest");
      setGuest((g) => (g ? { ...g, is_attending: false, message } : g));
    },
    [guest?.id],
  );

  function handleReset(){
    setOpened(false);
    setInvitationCode("");
  }

  return (
    <>
      {/* 1. Main wrapper is strictly 100dvh when closed, but becomes auto-scrolling when opened */}
      <main className={`relative flex flex-col no-scrollbar items-center bg-linear-to-b from-slate-950 to-gray-900 ${opened ? 'h-dvh overflow-y-auto' : 'h-dvh overflow-hidden'}`}>
        <div
          className="pointer-events-none absolute inset-0 z-0 min-h-full"
          aria-hidden
        >
          {stars.map((s) => (
            <span
              key={s.id}
              className={s.blur ? "star star-glow" : "star"}
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                animationDuration: `${s.duration}s`,
                animationDelay: `${-s.delay}s`,
              }}
            />
          ))}
        </div>
        <BackgroundMusic 
          src="/music/nights_like_this.mp3" 
          volume={0.3} 
        />
  
        {/* 2. FIXED: Changed h-[100dvh] to flex-1. It will now naturally expand to fill all 
            available space ABOVE the footer without pushing the footer off-screen. */}
       
        {opened && guest ? (
          <div
            ref={invitationCardRef}
            className="relative z-30 mt-10 flex w-full max-w-md shrink-0 flex-col gap-4 px-4 pb-16 pt-10"
          >
            <h1 className="font-cursive text-center text-5xl">
              You are invited!
            </h1>
            <InvitationCard
              guest={guest}
              onRSVP={handleRSVP}
              onCantGo={handleCantGo}
            />
            <GuideCard />

            <button onClick={handleReset} className="bg-blue-400 rounded-full p-3 text-white cursor-pointer">
              <span className="flex items-center justify-center gap-2">
                <GoSync strokeWidth={1}/>
                Enter another code
              </span>
            </button>
          </div>
        ) : 
        <div className="relative z-30 flex flex-1 w-full max-w-md shrink-0 flex-col items-center justify-center gap-3 px-6 text-center text-white transition-opacity duration-500">
        <BlurText
          text="A Starry Night"
          className="text-6xl font-bold font-cursive"
          delay={0.4}
          animateBy="words"
          direction="bottom"
        />

        <p className="fade-in-up-delay-1 italic text-gray-400">
          A cold, starry night awaits — and a warm feeling we can't quite
          name.
        </p>

        <div className="flex w-full flex-col gap-3 fade-in-up-delay-2">
          <input
            type="text"
            value={invitationCode}
            className="w-full rounded-full border border-gray-700 bg-gray-800 px-4 py-3 text-center text-white uppercase outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-gray-500"
            placeholder="Enter invitation code"
            minLength={6}
            maxLength={6}
            onChange={(e) => {
              setInvitationCode(e.target.value);
              setInviteLookupError(null);
            }}
            aria-invalid={inviteLookupError ? true : undefined}
            aria-describedby={
              inviteLookupError ? "invite-code-error" : undefined
            }
          />
          <SlideToOpen canOpen={hasInvitationCode} onOpen={handleSlideOpen} />
          {inviteLookupError ? (
            <p
              id="invite-code-error"
              className="text-sm text-red-400 transition-opacity duration-200"
              role="alert"
            >
              {inviteLookupError}
            </p>
          ) : null}
        </div>
      </div>
        }
  
        {/* 3. Footer wrapper - sits perfectly at the bottom of the screen */}
        <div className="flex gap-1 p-4 text-sm w-full items-center justify-center text-gray-400 relative z-30 mt-auto shrink-0">
          <span>
            Created by{" "}
            <a
              className="text-blue-400"
              href="https://johnallen.is-a.dev/"
              target="_blank"
              rel="noreferrer"
            >
              John Allen Valeña
            </a>
          </span>
          •
          <span>
            Sign in as{" "}
            <a href="/admin" className="text-blue-400">
              Event Master
            </a>
          </span>
        </div>
        <FallingSnow />
  
      </main>
    </>
  );
}

export default HomePage;
