"use client";

import { useState, useEffect } from "react";
import { KhojEvent } from "@/lib/types";
import { toggleSaveEvent, getSavedEvents } from "@/lib/eventsApi";
import { toggleRegisterEvent } from "@/lib/profileApi";
import { useAuth } from "@/context/AuthContext";
import { CategoryTag, DeadlineBadge, StatusChip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import {
  Calendar, Clock, MapPin, Monitor, Ticket, Trophy,
  Users, Award, Bookmark, ExternalLink, Share2, Copy, Check, ArrowLeft, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const bannerToneClasses: Record<string, string> = {
  primary: "bg-primary-50",
  success: "bg-success-50",
  warning: "bg-warning-50",
  error: "bg-error-50",
  default: "bg-neutral-100",
};

export function EventDetailsClient({ event }: { event: KhojEvent }) {
  const router = useRouter();
  const { role, token, isAuthenticated } = useAuth();
  const isOrganizerOrAdmin = isAuthenticated && (role === "organizer" || role === "admin");
  const [saved, setSaved] = useState(!!event.saved);
  const [registered, setRegistered] = useState(!!event.registered);
  const [isRegistering, setIsRegistering] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      getSavedEvents(token)
        .then((savedEvents) => {
          const matching = savedEvents.find((e) => e.id === event.id);
          if (matching) {
            setSaved(true);
            setRegistered(!!matching.registered);
          } else {
            setSaved(false);
            setRegistered(false);
          }
        })
        .catch(() => {});
    } else {
      setSaved(false);
      setRegistered(false);
    }
  }, [isAuthenticated, token, event.id]);

  const daysLeft = Math.ceil(
    (new Date(event.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  const handleSave = async () => {
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }
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

  const handleToggleRegister = async () => {
    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }
    setIsRegistering(true);
    const nextRegistered = !registered;
    setRegistered(nextRegistered);
    if (!saved && nextRegistered) setSaved(true);
    setToast(nextRegistered ? "Marked as registered!" : "Registration unmarked");

    try {
      const updated = await toggleRegisterEvent(event.id, token);
      setRegistered(updated.registered);
      setSaved(updated.saved);
    } catch {
      setRegistered(!nextRegistered);
      setToast("Failed to update registration status");
    } finally {
      setIsRegistering(false);
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-24">
      {/* Top Navigation Bar Link */}
      <div className="max-w-[1024px] mx-auto px-4 sm:px-6 pt-4 pb-2">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary-600 transition-colors bg-white/80 dark:bg-neutral-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
      </div>

      {/* Hero Banner */}
      <div
        className={`w-full h-48 md:h-72 relative overflow-hidden ${
          !event.bannerImageUrl
            ? bannerToneClasses[event.bannerColor] || bannerToneClasses.default
            : "bg-neutral-950"
        }`}
      >
        {event.bannerImageUrl && (
          <>
            <img
              src={event.bannerImageUrl}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-neutral-950/20 to-neutral-950/30" />
          </>
        )}
      </div>

      <div className="max-w-[1024px] mx-auto px-4 sm:px-6 -mt-16 md:-mt-24 relative z-10">

        <Card className="p-6 sm:p-8 shadow-sm mb-8 border-border-default bg-bg-surface">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <CategoryTag label={event.category} />
                <StatusChip status={event.status} />
                <DeadlineBadge daysLeft={daysLeft} />
                {registered && !isOrganizerOrAdmin && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-success text-white shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Registered
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-2 tracking-tight">{event.name}</h1>
              <p className="text-lg text-text-secondary">
                Organized by <span className="font-semibold text-text-primary">{event.organizerName}</span>
                {event.organizerVerified && (
                  <span className="ml-1 inline-flex items-center text-accent" title="Verified Organizer">✓</span>
                )}
              </p>
            </div>

            <div className="flex w-full md:w-64 flex-col gap-3 shrink-0">
              {isOrganizerOrAdmin ? (
                <div className="w-full">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full bg-bg-surface text-text-primary hover:bg-bg-surface-secondary justify-center"
                    onClick={() => setShareOpen(true)}
                    aria-label="Share event"
                  >
                    <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    Share Event
                  </Button>
                </div>
              ) : (
                <>
                  {/* Primary Action: Register Now */}
                  <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button size="lg" className="w-full">
                      Register Now
                      <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
                    </Button>
                  </Link>

                  {/* Secondary Self-Tracking Action: I've Registered */}
                  <div className="w-full">
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={handleToggleRegister}
                      disabled={isRegistering}
                      className={`w-full font-medium transition-colors ${
                        registered
                          ? "bg-success/15 text-success border-success/30 hover:bg-success/20"
                          : "bg-bg-surface text-text-primary hover:bg-bg-surface-secondary"
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 mr-2 ${registered ? "text-success" : "text-text-muted"}`} />
                      {registered ? "Registered ✓" : "I've Registered"}
                    </Button>
                    <p className="text-[12px] text-text-muted text-center mt-1.5 leading-snug">
                      Track your own registration status — not verified by Khoj
                    </p>
                  </div>

                  {/* Save & Share */}
                  <div className="flex gap-2 w-full">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="flex-1 bg-bg-surface text-text-primary hover:bg-bg-surface-secondary"
                      onClick={handleSave}
                      aria-label={saved ? "Remove from saved" : "Save event"}
                    >
                      <Bookmark
                        className={`w-4 h-4 mr-2 ${saved ? "fill-accent text-accent" : ""}`}
                        aria-hidden="true"
                      />
                      {saved ? "Saved" : "Save"}
                    </Button>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="bg-bg-surface text-text-primary hover:bg-bg-surface-secondary"
                      onClick={() => setShareOpen(true)}
                      aria-label="Share event"
                    >
                      <Share2 className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-text-primary mb-4">About this event</h2>
              <div className="text-text-secondary whitespace-pre-wrap leading-relaxed">{event.description}</div>
            </section>
            {event.rules && (
              <section>
                <h2 className="text-xl font-bold text-text-primary mb-4">Rules &amp; Guidelines</h2>
                <div className="bg-bg-surface rounded-2xl border border-border-default p-6 text-text-secondary whitespace-pre-wrap leading-relaxed shadow-xs">
                  {event.rules}
                </div>
              </section>
            )}
            {event.eligibility && (
              <section>
                <h2 className="text-xl font-bold text-text-primary mb-4">Eligibility</h2>
                <p className="text-text-secondary leading-relaxed">{event.eligibility}</p>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-5 border-border-default bg-bg-surface">
              <h3 className="font-bold text-text-primary mb-4">Event Details</h3>
              <ul className="space-y-4 text-sm text-text-secondary">
                <li className="flex gap-3">
                  <Calendar className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-text-primary">Date</p>
                    <p>{new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Clock className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-text-primary">Time</p>
                    <p>{event.eventTime}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  {event.mode === "online" ? (
                    <Monitor className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
                  ) : (
                    <MapPin className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-semibold text-text-primary">Location</p>
                    <p>{event.mode === "online" ? "Online" : `${event.venue}, ${event.city}`}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Ticket className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-text-primary">Registration Fee</p>
                    <p>{event.registrationFee}</p>
                  </div>
                </li>
                {event.prizePool && (
                  <li className="flex gap-3">
                    <Trophy className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-text-primary">Prize Pool</p>
                      <p>{event.prizePool}</p>
                    </div>
                  </li>
                )}
                {event.teamSize && (
                  <li className="flex gap-3">
                    <Users className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-text-primary">Team Size</p>
                      <p>{event.teamSize}</p>
                    </div>
                  </li>
                )}
                {event.certificateInfo && (
                  <li className="flex gap-3">
                    <Award className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-text-primary">Certificate</p>
                      <p>{event.certificateInfo}</p>
                    </div>
                  </li>
                )}
              </ul>
            </Card>

            <Card className="p-5 border-border-default bg-bg-surface">
              <h3 className="font-bold text-text-primary mb-4">Contact Organizer</h3>
              <div className="text-sm text-text-secondary whitespace-pre-wrap">{event.contactInfo}</div>
              {event.officialWebsite && (
                <Link
                  href={event.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center text-accent hover:underline font-semibold text-sm"
                >
                  Visit Official Website
                  <ExternalLink className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
                </Link>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar (Hidden for Organizer and Admin roles) */}
      {!isOrganizerOrAdmin && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-bg-surface/95 backdrop-blur border-t border-border-default md:hidden z-50 flex flex-col gap-1.5 shadow-lg">
          <div className="flex gap-2">
            <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full" size="lg">
                Register Now
                <ExternalLink className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleToggleRegister}
              disabled={isRegistering}
              aria-label={registered ? "Registered ✓" : "I've Registered"}
              className={`px-3.5 font-medium transition-colors ${
                registered
                  ? "bg-success/15 text-success border-success/30"
                  : "bg-bg-surface text-text-primary hover:bg-bg-surface-secondary"
              }`}
              title={registered ? "Registered ✓" : "I've Registered"}
            >
              <CheckCircle2 className={`w-5 h-5 ${registered ? "text-success" : "text-text-muted"}`} aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleSave}
              aria-label={saved ? "Remove from saved" : "Save"}
              className="bg-bg-surface text-text-primary px-3.5 hover:bg-bg-surface-secondary"
            >
              <Bookmark className={`w-5 h-5 ${saved ? "fill-accent text-accent" : ""}`} aria-hidden="true" />
            </Button>
          </div>
          <p className="text-[11px] text-text-muted text-center leading-tight">
            Track your own registration status — not verified by Khoj
          </p>
        </div>
      )}

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
