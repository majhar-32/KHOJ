import { getCategories } from "@/lib/eventsApi";
import { SubmitEventForm } from "@/components/SubmitEventForm";

export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = [
  "AI Competition",
  "Business Case Competition",
  "Career Fair",
  "Cultural Event",
  "Debate Competition",
  "Design Contest",
  "Gaming Tournament",
  "Hackathon",
  "Job Fair",
  "Olympiad",
  "Photography Contest",
  "Programming Contest",
  "Robotics Competition",
  "Seminar",
  "Sports Tournament",
  "Startup Competition",
  "Webinar",
  "Workshop",
];

export default async function SubmitEventPage() {
  let categories: string[] = [];
  try {
    categories = await getCategories();
  } catch (error) {
    // If backend is restarting or unavailable, gracefully fall back to default categories
    categories = DEFAULT_CATEGORIES;
  }

  if (!categories || categories.length === 0) {
    categories = DEFAULT_CATEGORIES;
  }

  return (
    <div className="min-h-screen bg-bg-page text-text-primary pb-20">
      <SubmitEventForm categories={categories} />
    </div>
  );
}
