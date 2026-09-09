import { Suspense } from "react";
import { SavedEventsClient } from "@/components/SavedEventsClient";

export const dynamic = "force-dynamic";

export default function SavedEventsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-500">Loading saved events...</div>}>
      <SavedEventsClient />
    </Suspense>
  );
}
