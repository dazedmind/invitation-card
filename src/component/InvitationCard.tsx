import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  GoCalendar,
  GoClock,
  GoLinkExternal,
  GoLocation,
  GoStar,
  GoStarFill,
} from "react-icons/go";

import type { GuestPublic } from "../types/guest";

type ModalKind = "closed" | "rsvp" | "cant_go";

function InvitationCard({
  guest,
  onRSVP,
  onCantGo,
}: {
  guest: GuestPublic;
  onRSVP: (message: string) => void | Promise<void>;
  onCantGo: (reason: string) => void | Promise<void>;
}) {
  const rsvpTitleId = useId();
  const cantGoTitleId = useId();
  const messageFieldId = useId();
  const reasonFieldId = useId();
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const reasonInputRef = useRef<HTMLTextAreaElement>(null);

  const [modal, setModal] = useState<ModalKind>("closed");
  const [celebrantMessage, setCelebrantMessage] = useState("");
  const [cantGoReason, setCantGoReason] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetModalUi = useCallback(() => {
    setModal("closed");
    setCelebrantMessage("");
    setCantGoReason("");
    setFieldError(null);
  }, []);

  const closeModal = useCallback(() => {
    if (submitting) return;
    resetModalUi();
  }, [submitting, resetModalUi]);

  useEffect(() => {
    if (modal === "closed") return;
    const t = window.setTimeout(() => {
      if (modal === "rsvp") messageInputRef.current?.focus();
      if (modal === "cant_go") reasonInputRef.current?.focus();
    }, 80);
    return () => window.clearTimeout(t);
  }, [modal]);

  useEffect(() => {
    if (modal === "closed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, closeModal]);

  const openRsvpModal = () => {
    setFieldError(null);
    setCelebrantMessage("");
    setModal("rsvp");
  };

  const openCantGoModal = () => {
    setFieldError(null);
    setCantGoReason("");
    setModal("cant_go");
  };

  const submitRsvp = async () => {
    setSubmitting(true);
    setFieldError(null);
    try {
      await onRSVP(celebrantMessage.trim());
      resetModalUi();
    } catch {
      setFieldError("Could not save your RSVP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitCantGo = async () => {
    const trimmed = cantGoReason.trim();
    if (!trimmed) {
      setFieldError("Please share why you can't attend.");
      return;
    }
    setSubmitting(true);
    setFieldError(null);
    try {
      await onCantGo(trimmed);
      resetModalUi();
    } catch {
      setFieldError("Could not save your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const modalOpen = modal !== "closed";

  return (
    <>
      <div className="invite-stack-in text-start flex flex-col gap-2 rounded-lg border border-gray-800 bg-slate-900 p-6 shadow-md backdrop-blur-sm">
        <h2 className="text-3xl font-bold">{guest.name}</h2>
        <span className="flex items-center gap-2 w-fit rounded-md bg-blue-500/10 px-3 py-1 text-xs text-blue-500">
          {/* <GoStarFill/>  */}
          <p>
            You&apos;re part of the{" "}
            <span className="font-bold">{guest.guest_type}!</span>
          </p>
        </span>

        <p className="text-sm text-gray-500">
          You are invited to a special event:
        </p>

        <h2 className="text-xl font-medium text-blue-400">
          Jazzi&apos;s 18th Birthday
        </h2>

        <p className="text-xs text-gray-400">
          Your Status:{" "}
          <span
            className={`font-medium text-gray-200  ${guest.is_attending ? "text-green-300" : "text-gray-400"}`}
          >
            {guest.is_attending ? "Attending" : "Not attending"}
          </span>
        </p>
        <p className="text-xs text-gray-400 flex flex-col gap-2">
          Your Message:{" "}
          {guest.message ? (
            <p className="flex flex-col rounded-lg border border-white/10  px-3 py-2 text-xs leading-relaxed text-gray-300 transition-colors duration-200">
              {guest.message}
            </p>
          ) : null}
        </p>

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
              <span className="font-bold">6:00 PM</span>
            </span>
          </li>
          <li>
            <span className="flex flex-row items-center gap-1">
              <GoLocation /> Venue:
              <span className="font-bold">123 Main St, Anytown, USA</span>
            </span>
            <button
              type="button"
              className="invite-pressable mt-2 flex w-full cursor-pointer items-center justify-center gap-1 rounded-full border border-transparent py-2 text-center text-sm text-blue-400 hover:text-blue-300"
            >
              <GoLinkExternal /> View on Google Maps
            </button>
          </li>
        </ul>
        <button
          type="button"
          onClick={openRsvpModal}
          disabled={guest.is_attending}
          className={`invite-pressable w-full cursor-pointer rounded-full p-2 text-white ${guest.is_attending ? "bg-gray-100/50" : "bg-blue-500 hover:bg-blue-400"}`}
        >
          {guest.is_attending ? "RSVP Confirmed" : "RSVP"}
        </button>
        <button
          type="button"
          onClick={openCantGoModal}
          className="invite-pressable w-full cursor-pointer rounded-full border border-gray-700 bg-transparent p-2 text-white hover:border-gray-500 hover:bg-white/5"
        >
          Can&apos;t Go?
        </button>
      </div>

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
            aria-labelledby={modal === "rsvp" ? rsvpTitleId : cantGoTitleId}
            className="invite-modal-panel relative w-full max-w-md overflow-hidden rounded-2xl   bg-slate-900/95 p-6 text-left text-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)]"
          >
            {modal === "rsvp" ? (
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
                  className="min-h-[120px] w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none duration-200 placeholder:text-gray-500 focus:border-sky-400/50"
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
                  className="min-h-[120px] w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none duration-200 placeholder:text-gray-500 focus:border-sky-400/50 "
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
