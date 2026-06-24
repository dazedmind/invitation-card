import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  GoCalendar,
  GoClock,
  GoLinkExternal,
  GoLocation,
  GoVerified,
  GoSkip,
} from "react-icons/go";
import type { GuestPublic } from "../types/guest";

type ModalKind = "closed" | "rsvp" | "cant_go";
type ModalState = {
  kind: ModalKind;
  guestId: number | null;
};

function InvitationCard({
  guests,
  onRSVP,
  onCantGo,
}: {
  guests: GuestPublic[];
  onRSVP: (guestId: number, message: string) => void | Promise<void>;
  onCantGo: (guestId: number, reason: string) => void | Promise<void>;
}) {
  const rsvpTitleId = useId();
  const cantGoTitleId = useId();
  const messageFieldId = useId();
  const reasonFieldId = useId();
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const reasonInputRef = useRef<HTMLTextAreaElement>(null);

  const [modal, setModal] = useState<ModalState>({
    kind: "closed",
    guestId: null,
  });
  const [celebrantMessage, setCelebrantMessage] = useState("");
  const [cantGoReason, setCantGoReason] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetModalUi = useCallback(() => {
    setModal({ kind: "closed", guestId: null });
    setCelebrantMessage("");
    setCantGoReason("");
    setFieldError(null);
  }, []);

  const closeModal = useCallback(() => {
    if (submitting) return;
    resetModalUi();
  }, [submitting, resetModalUi]);

  useEffect(() => {
    if (modal.kind === "closed") return;
    const t = window.setTimeout(() => {
      if (modal.kind === "rsvp") messageInputRef.current?.focus();
      if (modal.kind === "cant_go") reasonInputRef.current?.focus();
    }, 80);
    return () => window.clearTimeout(t);
  }, [modal.kind]);

  useEffect(() => {
    if (modal.kind === "closed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal.kind, closeModal]);

  const openRsvpModal = (guestId: number) => {
    setFieldError(null);
    setCelebrantMessage("");
    setModal({ kind: "rsvp", guestId });
  };

  const openCantGoModal = (guestId: number) => {
    setFieldError(null);
    setCantGoReason("");
    setModal({ kind: "cant_go", guestId });
  };

  const submitRsvp = async () => {
    if (modal.guestId == null) return;
    setSubmitting(true);
    setFieldError(null);
    try {
      await onRSVP(modal.guestId, celebrantMessage.trim());
      resetModalUi();
    } catch {
      setFieldError("Could not save your RSVP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitCantGo = async () => {
    if (modal.guestId == null) return;
    const trimmed = cantGoReason.trim();
    if (!trimmed) {
      setFieldError("Please share why you can't attend.");
      return;
    }
    setSubmitting(true);
    setFieldError(null);
    try {
      await onCantGo(modal.guestId, trimmed);
      resetModalUi();
    } catch {
      setFieldError("Could not save your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const modalOpen = modal.kind !== "closed";

  return (
    <>
      <div className="invite-stack-in text-start overflow-hidden rounded-2xl bg-slate-900 shadow-md backdrop-blur-sm">
        <span className="">
          <img src="/starry-bg.webp" alt="Starry Background" />
        </span>

        <div className="flex flex-col gap-2 p-6">
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <span className="flex flex-row items-center gap-1">
                <GoCalendar /> Date:
                <span className="font-bold">July 19, 2026</span>
              </span>
            </li>
            <li>
              <span className="flex flex-row items-center gap-1">
                <GoClock /> Time:
                <span className="font-bold">5:00 PM</span>
              </span>
            </li>
            <li>
              <span className="flex flex-row items-start gap-1">
                <span className="flex items-center gap-1">
                  <GoLocation />
                  Venue:
                </span>
                <span className="font-bold">Steelworld Tower, QC</span>
              </span>

              <a
                href="https://www.google.com/maps/place/Steelworld+Tower/data=!4m2!3m1!1s0x0:0x87b8da959fe13123?sa=X&ved=1t:2428&ictx=111"
                target="_blank"
              >
                <button
                  type="button"
                  className="invite-pressable mt-2 flex w-full cursor-pointer items-center justify-center gap-1 rounded-full border border-blue-400 py-2 text-center text-sm text-blue-400 hover:text-blue-300"
                >
                  <GoLinkExternal /> View on Google Maps
                </button>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {guests.map((guest) => (
        <div
          key={guest.id}
          className="invite-stack-in text-start overflow-hidden rounded-2xl  bg-slate-900 shadow-md backdrop-blur-sm"
        >
          <div className="p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-semibold  text-blue-400">
                {guest.name}
              </h2>
            </div>

            {guest.guest_type !== "Guest" ? (
              <span className="flex items-center text-sm gap-1">
                <p>
                  You&apos;re part of the{" "}
                </p>
                <span className="font-bold text-blue-400 flex items-center gap-2 w-fit rounded-md bg-blue-500/10 px-2 py-1">{guest.guest_type}!</span>
              </span>
            ) : null}

              <span
                className={`font-medium p-1 text-sm rounded-full w-fit text-gray-200  ${guest.is_attending ? "text-green-300 bg-green-400/10 " : "text-gray-400 bg-gray-400/10 "}`}
              >
                {guest.is_attending ? (
                  <span className="flex items-center gap-1 text-xs px-1">
                    <GoVerified /> Going
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs px-1">
                    <GoSkip /> Not Going
                  </span>
                )}
              </span>
            {guest.message ? (
              <span className="flex flex-col gap-2 text-xs text-gray-400 ">
                Your Message:{" "}
                <p className="flex flex-col rounded-lg bg-slate-950/20 px-3 py-2 text-xs leading-relaxed text-gray-400 transition-colors duration-200">
                  {guest.message}
                </p>
              </span>
            ) : null}

            <span className="flex flex-row-reverse gap-2 mt-2">
              <button
                type="button"
                onClick={() => openRsvpModal(guest.id)}
                disabled={guest.is_attending}
                className={`invite-pressable w-full cursor-pointer text-sm rounded-full p-2 text-white ${guest.is_attending ? "bg-gray-100/50" : "bg-blue-500 hover:bg-blue-400"}`}
              >
                {guest.is_attending ? "Confirmed" : "RSVP"}
              </button>
              <button
                type="button"
                onClick={() => openCantGoModal(guest.id)}
                className="invite-pressable w-full cursor-pointer text-sm rounded-full border border-gray-700 bg-transparent p-2 text-white hover:border-gray-500 hover:bg-white/5"
              >
                Can&apos;t Go?
              </button>
            </span>
          </div>
        </div>
      ))}

      {modalOpen ? (
        <div className="fixed inset-0 z-80 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Close"
            disabled={submitting}
            className="invite-modal-backdrop absolute inset-0 cursor-default bg-black/65 backdrop-blur-[2px] transition-opacity duration-300"
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={
              modal.kind === "rsvp" ? rsvpTitleId : cantGoTitleId
            }
            className="invite-modal-panel relative w-full max-w-md overflow-hidden rounded-2xl   bg-slate-900/95 p-6 text-left text-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)]"
          >
            {modal.kind === "rsvp" ? (
              <div key="rsvp" className="invite-modal-step flex flex-col gap-4">
                <span className="flex flex-col gap-1">
                  <h3
                    id={rsvpTitleId}
                    className="text-lg font-semibold tracking-tight"
                  >
                    Add a Little Note for Jazzi
                  </h3>
                  <p className="text-sm text-gray-400">
                    Got something sweet, silly, or heartfelt to say? Leave a
                    message for Jazzi below — or simply RSVP and let her know
                    you’ll be there.
                  </p>
                </span>

                <label htmlFor={messageFieldId} className="sr-only">
                  Message for the celebrant (optional)
                </label>
                <textarea
                  id={messageFieldId}
                  ref={messageInputRef}
                  value={celebrantMessage}
                  onChange={(e) => {
                    setCelebrantMessage(e.target.value);
                    setFieldError(null);
                  }}
                  rows={4}
                  placeholder="Write something you want to say to Jazzi…"
                  disabled={submitting}
                  className="min-h-30 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none duration-200 placeholder:text-gray-500 focus:border-sky-400/50"
                />
                {fieldError ? (
                  <p className="text-sm text-amber-300" role="alert">
                    {fieldError}
                  </p>
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={closeModal}
                    className="invite-pressable rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void submitRsvp()}
                    className="invite-pressable rounded-full bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white  hover:bg-sky-400 cursor-pointer"
                  >
                    {submitting ? "Saving…" : "Confirm RSVP"}
                  </button>
                </div>
              </div>
            ) : (
              <div
                key="cant_go"
                className="invite-modal-step flex flex-col gap-4"
              >
                <span className="flex flex-col gap-1">
                  <h3
                    id={cantGoTitleId}
                    className="text-lg font-semibold tracking-tight"
                  >
                    We're sad that you can't make it
                  </h3>
                  <p className="text-sm text-gray-400">
                    Please share a short message so the host knows why you
                    can&apos;t attend.
                  </p>
                </span>
                <label htmlFor={reasonFieldId} className="sr-only">
                  Reason you can&apos;t attend
                </label>
                <textarea
                  id={reasonFieldId}
                  ref={reasonInputRef}
                  value={cantGoReason}
                  onChange={(e) => {
                    setCantGoReason(e.target.value);
                    setFieldError(null);
                  }}
                  rows={4}
                  placeholder="Let the host know…"
                  disabled={submitting}
                  className="min-h-30 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none duration-200 placeholder:text-gray-500 focus:border-sky-400/50 "
                />
                {fieldError ? (
                  <p className="text-sm text-red-300" role="alert">
                    {fieldError}
                  </p>
                ) : null}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={closeModal}
                    className="invite-pressable rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void submitCantGo()}
                    className="invite-pressable rounded-full bg-rose-500/90 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-400 cursor-pointer"
                  >
                    {submitting ? "Saving…" : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default InvitationCard;
