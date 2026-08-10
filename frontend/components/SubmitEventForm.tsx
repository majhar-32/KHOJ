"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent, simulateAIExtraction } from "@/lib/mockApi";
import { KhojEvent } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Sparkles, AlertTriangle } from "lucide-react";

type FormMode = "create" | "edit";

interface SubmitEventFormProps {
  categories: string[];
  mode?: FormMode;
  /** The existing event — only used in edit mode */
  initialData?: KhojEvent;
}

export function SubmitEventForm({ categories, mode = "create", initialData }: SubmitEventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI State (hidden in edit mode — keeps the form focused on reviewing existing data)
  const [rawAIText, setRawAIText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());

  // Form State — pre-filled from initialData in edit mode
  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    category: initialData?.category ?? categories[0] ?? "",
    eventDate: initialData?.eventDate ?? "",
    eventTime: initialData?.eventTime ?? "",
    mode: (initialData?.mode ?? "offline") as "online" | "offline",
    venue: initialData?.venue ?? "",
    city: initialData?.city ?? "",
    registrationDeadline: initialData?.registrationDeadline ?? "",
    registrationFee: initialData?.registrationFee ?? "Free",
    prizePool: initialData?.prizePool ?? "",
    eligibility: initialData?.eligibility ?? "",
    teamSize: initialData?.teamSize ?? "1",
    availableSeats: initialData?.availableSeats?.toString() ?? "",
    certificateInfo: initialData?.certificateInfo ?? "",
    description: initialData?.description ?? "",
    rules: initialData?.rules ?? "",
    contactInfo: initialData?.contactInfo ?? "",
    registrationLink: initialData?.registrationLink ?? "",
    officialWebsite: initialData?.officialWebsite ?? "",
    bannerColor: initialData?.bannerColor ?? "primary",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (aiFilledFields.has(id)) {
      setAiFilledFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleAIAutoFill = async () => {
    if (!rawAIText.trim()) return;
    setIsExtracting(true);
    setAiError(null);
    try {
      const extracted = await simulateAIExtraction(rawAIText);
      const newlyFilled = new Set<string>();
      const updatedData = { ...formData };
      for (const [key, value] of Object.entries(extracted)) {
        if (value) {
          (updatedData as Record<string, unknown>)[key] = value;
          newlyFilled.add(key);
        }
      }
      if (rawAIText) {
        updatedData.description = rawAIText;
        newlyFilled.add("description");
      }
      setFormData(updatedData);
      setAiFilledFields(newlyFilled);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Couldn't auto-fill from this text — please fill the form manually below.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "edit" && initialData) {
        await updateEvent(initialData.id, {
          ...formData,
          availableSeats: formData.availableSeats ? parseInt(formData.availableSeats, 10) : null,
        });
      } else {
        await createEvent({
          ...formData,
          organizerName: "BUET Computer Club",
          organizerVerified: true,
          availableSeats: formData.availableSeats ? parseInt(formData.availableSeats, 10) : null,
        });
      }
      router.push("/dashboard/organizer");
    } catch (error) {
      console.error("Failed to submit event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLabel = (text: string, id: string) => (
    <span className="flex items-center gap-2">
      {text}
      {aiFilledFields.has(id) && (
        <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700 border border-primary-200">
          <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
          AI-filled
        </span>
      )}
    </span>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {mode === "edit" ? "Edit Event" : "Submit New Event"}
        </h1>
        <p className="text-neutral-600">
          {mode === "edit"
            ? "Update the details below. Saving will re-submit this event for admin review."
            : "Fill out the details below to submit your event for review."}
        </p>
      </div>

      {/* Edit mode banner — warn about re-approval */}
      {mode === "edit" && initialData?.status === "approved" && (
        <div className="mb-6 flex gap-3 rounded-xl border border-warning-300 bg-warning-50 p-4">
          <AlertTriangle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-warning-800">
            <span className="font-semibold">Editing a live event</span> will require admin re-approval before your changes go public.
          </p>
        </div>
      )}

      {/* AI Assist Section — only shown in create mode */}
      {mode === "create" && (
        <Card className="mb-8 p-6 bg-primary-50/50 border-primary-100 border-dashed border-2">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" aria-hidden="true" />
                AI-Assisted Autofill (Optional)
              </h2>
              <p className="text-sm text-primary-700 mt-1">
                Paste your raw event details (like a Facebook post or email) and our AI will try to extract the information for you.
              </p>
            </div>
            <Textarea
              value={rawAIText}
              onChange={(e) => setRawAIText(e.target.value)}
              placeholder="Paste your event description here..."
              rows={3}
            />
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleAIAutoFill}
                disabled={!rawAIText.trim() || isExtracting}
              >
                <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
                {isExtracting ? "Extracting..." : "Auto-fill with AI"}
              </Button>
              {aiError && <span className="text-sm text-error-600">{aiError}</span>}
              {aiFilledFields.size > 0 && !aiError && (
                <span className="text-sm text-success-600 font-medium">Successfully extracted data! Please review the fields below.</span>
              )}
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Basic Details</h2>
          <div className="space-y-4">
            <Input id="name" label={renderLabel("Event Name", "name")} required value={formData.name} onChange={handleChange} placeholder="e.g. National Hackathon 2024" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select id="category" label={renderLabel("Category", "category")} required value={formData.category} onChange={handleChange}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select id="bannerColor" label={renderLabel("Banner Theme", "bannerColor")} value={formData.bannerColor} onChange={handleChange}>
                <option value="primary">Blue (Primary)</option>
                <option value="success">Green (Success)</option>
                <option value="warning">Amber (Warning)</option>
                <option value="error">Red (Error)</option>
              </Select>
            </div>
            <Textarea id="description" label={renderLabel("Description", "description")} required value={formData.description} onChange={handleChange} placeholder="Tell us about the event..." />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Date &amp; Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input id="eventDate" type="date" label={renderLabel("Event Date", "eventDate")} required value={formData.eventDate} onChange={handleChange} />
            <Input id="eventTime" type="time" label={renderLabel("Event Time", "eventTime")} required value={formData.eventTime} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select id="mode" label={renderLabel("Mode", "mode")} required value={formData.mode} onChange={handleChange}>
              <option value="offline">Offline / In-person</option>
              <option value="online">Online</option>
            </Select>
            <Input id="city" label={renderLabel("City", "city")} value={formData.city} onChange={handleChange} disabled={formData.mode === "online"} placeholder={formData.mode === "online" ? "N/A" : "e.g. Dhaka"} />
          </div>
          <Input id="venue" label={renderLabel("Venue", "venue")} value={formData.venue} onChange={handleChange} className="mt-4" disabled={formData.mode === "online"} placeholder={formData.mode === "online" ? "Online Platform Link will be provided" : "e.g. BUET ECE Building"} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Registration &amp; Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input id="registrationDeadline" type="date" label={renderLabel("Registration Deadline", "registrationDeadline")} required value={formData.registrationDeadline} onChange={handleChange} />
            <Input id="registrationFee" label={renderLabel("Registration Fee", "registrationFee")} required value={formData.registrationFee} onChange={handleChange} placeholder="e.g. Free, or ৳500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input id="teamSize" label={renderLabel("Team Size", "teamSize")} required value={formData.teamSize} onChange={handleChange} placeholder="e.g. 1-3 members" />
            <Input id="availableSeats" type="number" label={renderLabel("Available Seats (Optional)", "availableSeats")} value={formData.availableSeats} onChange={handleChange} placeholder="e.g. 100" />
          </div>
          <Input id="eligibility" label={renderLabel("Eligibility", "eligibility")} required value={formData.eligibility} onChange={handleChange} className="mb-4" placeholder="e.g. University students only" />
          <Textarea id="rules" label={renderLabel("Rules & Guidelines (Optional)", "rules")} value={formData.rules} onChange={handleChange} rows={3} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Links &amp; Additional Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input id="prizePool" label={renderLabel("Prize Pool (Optional)", "prizePool")} value={formData.prizePool} onChange={handleChange} placeholder="e.g. ৳50,000 Total" />
            <Input id="certificateInfo" label={renderLabel("Certificate Info (Optional)", "certificateInfo")} value={formData.certificateInfo} onChange={handleChange} placeholder="e.g. Yes, for all participants" />
          </div>
          <Textarea id="contactInfo" label={renderLabel("Contact Information", "contactInfo")} required value={formData.contactInfo} onChange={handleChange} rows={2} placeholder="Email, phone number, or social links for support" className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="registrationLink" type="url" label={renderLabel("Registration Link", "registrationLink")} required value={formData.registrationLink} onChange={handleChange} placeholder="https://..." />
            <Input id="officialWebsite" type="url" label={renderLabel("Official Website (Optional)", "officialWebsite")} value={formData.officialWebsite} onChange={handleChange} placeholder="https://..." />
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? (mode === "edit" ? "Saving..." : "Submitting...")
              : (mode === "edit" ? "Save Changes" : "Submit Event for Review")}
          </Button>
        </div>
      </form>
    </div>
  );
}
