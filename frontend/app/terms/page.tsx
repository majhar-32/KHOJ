import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Khoj",
  description: "Terms of Service and guidelines for using Khoj.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Terms of Service
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Effective Date: March 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">
          <section className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">1. Discovery Platform Disclaimer</h2>
            <p>
              Khoj acts strictly as an informational aggregator and discovery platform. We are not the host, producer, organizer, or ticketing agent of the events listed. Any inquiries, fee disputes, date changes, or cancellations are the sole responsibility of the individual event organizers.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">2. Organizer Responsibilities</h2>
            <p>
              Organizers submitting events certify that the information provided is accurate, up to date, and adheres to community standards. Misleading information, unauthorized commercial solicitations, or fraudulent contests may be removed without prior notice.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">3. Content Integrity & Moderation</h2>
            <p>
              Khoj moderators review submitted event listings before publication to maintain catalog quality. Khoj reserves the right to decline or unpublish any event listing that violates platform terms or community safety standards.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
