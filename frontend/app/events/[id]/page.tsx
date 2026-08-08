import { getEventById } from "@/lib/mockApi";
import { notFound } from "next/navigation";
import { CategoryTag, DeadlineBadge, StatusChip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { 
  Calendar, Clock, MapPin, Monitor, Ticket, Trophy, 
  Users, Award, Bookmark, ExternalLink, Mail, Phone
} from "lucide-react";
import Link from "next/link";

const bannerToneClasses: Record<string, string> = {
  primary: "bg-primary-50",
  success: "bg-success-50",
  warning: "bg-warning-50",
  error: "bg-error-50",
  default: "bg-neutral-100",
};

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id);

  if (!event) {
    notFound();
  }

  const daysLeft = Math.ceil(
    (new Date(event.registrationDeadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
  );

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Hero Banner */}
      <div 
        className={`w-full h-48 md:h-64 ${bannerToneClasses[event.bannerColor] || bannerToneClasses.default}`}
      ></div>

      <div className="max-w-[1024px] mx-auto px-4 sm:px-6 -mt-16 md:-mt-24 relative z-10">
        <Card className="p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <CategoryTag label={event.category} />
                <StatusChip status={event.status} />
                <DeadlineBadge daysLeft={daysLeft} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
                {event.name}
              </h1>
              <p className="text-lg text-neutral-600">
                Organized by <span className="font-semibold text-neutral-900">{event.organizerName}</span>
                {event.organizerVerified && (
                  <span className="ml-1 inline-flex items-center text-primary-600" title="Verified Organizer">
                    {/* SVG verified badge placeholder */}
                    ✓
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex w-full md:w-auto flex-row md:flex-col gap-3 shrink-0">
              <Button size="lg" className="flex-1 md:w-full">
                Register Now
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="secondary" className="flex-1 md:w-full bg-white">
                <Bookmark className="w-4 h-4 mr-2" />
                {event.saved ? "Saved" : "Save Event"}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-neutral-900 mb-4">About this event</h2>
              <div className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {event.description}
              </div>
            </section>

            {event.rules && (
              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Rules & Guidelines</h2>
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
                  <Calendar className="w-5 h-5 text-neutral-400 shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-900">Date</p>
                    <p>{new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Clock className="w-5 h-5 text-neutral-400 shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-900">Time</p>
                    <p>{event.eventTime}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  {event.mode === "online" ? (
                    <Monitor className="w-5 h-5 text-neutral-400 shrink-0" />
                  ) : (
                    <MapPin className="w-5 h-5 text-neutral-400 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-neutral-900">Location</p>
                    <p>{event.mode === "online" ? "Online" : `${event.venue}, ${event.city}`}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Ticket className="w-5 h-5 text-neutral-400 shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-900">Registration Fee</p>
                    <p>{event.registrationFee}</p>
                  </div>
                </li>
                {event.prizePool && (
                  <li className="flex gap-3">
                    <Trophy className="w-5 h-5 text-neutral-400 shrink-0" />
                    <div>
                      <p className="font-medium text-neutral-900">Prize Pool</p>
                      <p>{event.prizePool}</p>
                    </div>
                  </li>
                )}
                {event.teamSize && (
                  <li className="flex gap-3">
                    <Users className="w-5 h-5 text-neutral-400 shrink-0" />
                    <div>
                      <p className="font-medium text-neutral-900">Team Size</p>
                      <p>{event.teamSize}</p>
                    </div>
                  </li>
                )}
                {event.certificateInfo && (
                  <li className="flex gap-3">
                    <Award className="w-5 h-5 text-neutral-400 shrink-0" />
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
              <div className="text-sm text-neutral-700 whitespace-pre-wrap">
                {event.contactInfo}
              </div>
              {event.officialWebsite && (
                <Link 
                  href={event.officialWebsite}
                  target="_blank"
                  className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Visit Official Website
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </Link>
              )}
            </Card>
          </div>
        </div>
      </div>
      
      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200 md:hidden z-50">
        <Button className="w-full" size="lg">
          Register Now
        </Button>
      </div>
    </div>
  );
}
