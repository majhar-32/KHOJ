"use client";

import { useState, useEffect } from "react";
import { KhojEvent } from "@/lib/types";
import { toggleSaveEvent, getSavedEvents } from "@/lib/eventsApi";
import { useAuth } from "@/context/AuthContext";
import { CategoryTag, DeadlineBadge, StatusChip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import {
  Calendar, Clock, MapPin, Monitor, Ticket, Trophy,
  Users, Award, Bookmark, ExternalLink, Share2, Copy, Check
} from "lucide-react";
import Link from "next/link";

const bannerToneClasses: Record<string, string> = {
  primary: "bg-primary-50",
  success: "bg-success-50",
  warning: "bg-warning-50",
  error: "bg-error-50",
  default: "bg-neutral-100",
};

export function EventDetailsClient({ event }: { event: KhojEvent }) {
  const { token, isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(!!event.saved);
  const [toast, setToast] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      getSavedEvents(token)
        .then((savedEvents) => {
          setSaved(savedEvents.some((e) => e.id === event.id));
        })
        .catch(() => {});
    } else {
      setSaved(false);
    }
  }, [isAuthenticated, token, event.id]);

  const daysLeft = Math.ceil(
    (new Date(event.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  const handleSave = async () => {
    if (!isAuthenticated || !token) return;
    const nextSaved = !saved;
    setSaved(nextSaved);
    setToast(nextSaved ? "Saved!" : "Removed from saved");

    try {
      const updated = await toggleSaveEvent(event.id, token);
      if (updated !== undefined) {
        setSaved(updated.saved);
      }
    } catch {
      setSaved(!nextSaved);
      setToast("Failed to update bookmark");
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out this event: ${event.name}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Hero Banner */}
      <div className={`w-full h-48 md:h-64 ${bannerToneClasses[event.bannerColor] || bannerToneClasses.default}`} />

      <div className="max-w-[1024px] mx-auto px-4 sm:px-6 -mt-16 md:-mt-24 relative z-10">
        <Card className="p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <CategoryTag label={event.category} />
                <StatusChip status={event.status} />
                <DeadlineBadge daysLeft={daysLeft} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">{event.name}</h1>
              <p className="text-lg text-neutral-600">
                Organized by <span className="font-semibold text-neutral-900">{event.organizerName}</span>
                {event.organizerVerified && (
                  <span className="ml-1 inline-flex items-center text-primary-600" title="Verified Organizer">✓</span>
                )}
              </p>
            </div>

            <div className="flex w-full md:w-auto flex-row md:flex-col gap-3 shrink-0">
              <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="flex-1 md:w-full">
                <Button size="lg" className="w-full">
                  Register Now
                  <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
              </Link>
              <div className="flex gap-2">
                {isAuthenticated && (
                  <Button
                    size="lg"
                    variant="secondary"
                    className="flex-1 bg-white"
                    onClick={handleSave}
                    aria-label={saved ? "Remove from saved" : "Save event"}
                  >
                    <Bookmark
                      className={`w-4 h-4 mr-2 ${saved ? "fill-primary-600 text-primary-600" : ""}`}
                      aria-hidden="true"
                    />
                    {saved ? "Saved" : "Save"}
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="secondary"
                  className={`bg-white ${!isAuthenticated ? "flex-1" : ""}`}
                  onClick={() => setShareOpen(true)}
                  aria-label="Share event"
                >
                  <Share2 className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">About this event</h2>
              <div className="text-neutral-700 whitespace-pre-wrap leading-relaxed">{event.description}</div>
            </section>
            {event.rules && (
              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Rules &amp; Guidelines</h2>
                <div className="bg-white rounded-xl border border-neutral-200 p-5 text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  {event.rules}
                </div>
              </section>
            )}
            {event.eligibility && (
              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Eligibility</h2>
                <p className="text-neutral-700">{event.eligibility}</p>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="font-bold text-neutral-900 mb-4">Event Details</h3>
              <ul className="space-y-4 text-sm text-neutral-700">
                <li className="flex gap-3">
                  <Calendar className="w-5 h-5 text-neutral-400 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-neutral-900">Date</p>
                    <p>{new Date(event.eventDate).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Clock className="w-5 h-5 text-neutral-400 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-neutral-900">Time</p>
                    <p>{event.eventTime}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  {event.mode === "online" ? (
                    <Monitor className="w-5 h-5 text-neutral-400 shrink-0" aria-hidden="true" />
                  ) : (
                    <MapPin className="w-5 h-5 text-neutral-400 shrink-0" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-medium text-neutral-900">Location</p>
                    <p>{event.mode === "online" ? "Online" : `${event.venue}, ${event.city}`}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Ticket className="w-5 h-5 text-neutral-400 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-neutral-900">Registration Fee</p>
                    <p>{event.registrationFee}</p>
                  </div>
                </li>
                {event.prizePool && (
                  <li className="flex gap-3">
                    <Trophy className="w-5 h-5 text-neutral-400 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-neutral-900">Prize Pool</p>
                      <p>{event.prizePool}</p>
                    </div>
                  </li>
                )}
                {event.teamSize && (
                  <li className="flex gap-3">
                    <Users className="w-5 h-5 text-neutral-400 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-neutral-900">Team Size</p>
                      <p>{event.teamSize}</p>
                    </div>
                  </li>
                )}
                {event.certificateInfo && (
                  <li className="flex gap-3">
                    <Award className="w-5 h-5 text-neutral-400 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-neutral-900">Certificate</p>
                      <p>{event.certificateInfo}</p>
                    </div>
                  </li>
                )}
              </ul>
            </Card>

            <Card className="p-5">
              <h3 className="font-bold text-neutral-900 mb-4">Contact Organizer</h3>
              <div className="text-sm text-neutral-700 whitespace-pre-wrap">{event.contactInfo}</div>
              {event.officialWebsite && (
                <Link
                  href={event.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Visit Official Website
                  <ExternalLink className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                </Link>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200 md:hidden z-50 flex gap-3">
        <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button className="w-full" size="lg">Register Now</Button>
        </Link>
        {isAuthenticated && (
          <Button variant="secondary" size="lg" onClick={handleSave} aria-label={saved ? "Remove from saved" : "Save"} className="bg-white">
            <Bookmark className={`w-5 h-5 ${saved ? "fill-primary-600 text-primary-600" : ""}`} aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Share Modal */}
      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title="Share this Event">
        <div className="space-y-4">
          <p className="text-sm font-medium text-neutral-900">{event.name}</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              aria-label="Shareable link"
              className="flex-1 h-10 rounded-lg border border-neutral-300 bg-neutral-50 px-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <Button variant="secondary" onClick={handleCopy} aria-label="Copy link">
              {copied ? <Check className="w-4 h-4 text-success-600" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            </Button>
          </div>
          {copied && <p className="text-xs text-success-600">Copied to clipboard!</p>}
          <div>
            <p className="text-xs text-neutral-500 mb-3">Share via</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                WhatsApp
              </Link>
              <Link
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Facebook
              </Link>
              <Link
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                LinkedIn
              </Link>
              <Link
                href={`mailto:?subject=${encodeURIComponent(event.name)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Email
              </Link>
            </div>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
