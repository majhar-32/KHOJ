"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/mockApi";

import { Card } from "@/components/ui/Card";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SubmitEventForm({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: categories[0] || "",
    eventDate: "",
    eventTime: "",
    mode: "offline" as "online" | "offline",
    venue: "",
    city: "",
    registrationDeadline: "",
    registrationFee: "Free",
    prizePool: "",
    eligibility: "",
    teamSize: "1",
    availableSeats: "",
    certificateInfo: "",
    description: "",
    rules: "",
    contactInfo: "",
    registrationLink: "",
    officialWebsite: "",
    bannerColor: "primary",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createEvent({
        ...formData,
        organizerName: "BUET Computer Club", // Mocking the logged-in organizer
        organizerVerified: true,
        availableSeats: formData.availableSeats ? parseInt(formData.availableSeats, 10) : null,
      });

      router.push("/dashboard/organizer");
    } catch (error) {
      console.error("Failed to submit event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Submit New Event</h1>
        <p className="text-neutral-600">Fill out the details below to submit your event for review.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Basic Details</h2>
          <div className="space-y-4">
            <Input id="name" label="Event Name" required value={formData.name} onChange={handleChange} placeholder="e.g. National Hackathon 2024" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select id="category" label="Category" required value={formData.category} onChange={handleChange}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select id="bannerColor" label="Banner Theme" value={formData.bannerColor} onChange={handleChange}>
                <option value="primary">Blue (Primary)</option>
                <option value="success">Green (Success)</option>
                <option value="warning">Amber (Warning)</option>
                <option value="error">Red (Error)</option>
              </Select>
            </div>
            
            <Textarea id="description" label="Description" required value={formData.description} onChange={handleChange} placeholder="Tell us about the event..." />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Date & Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input id="eventDate" type="date" label="Event Date" required value={formData.eventDate} onChange={handleChange} />
            <Input id="eventTime" type="time" label="Event Time" required value={formData.eventTime} onChange={handleChange} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select id="mode" label="Mode" required value={formData.mode} onChange={handleChange}>
              <option value="offline">Offline / In-person</option>
              <option value="online">Online</option>
            </Select>
            <Input id="city" label="City" value={formData.city} onChange={handleChange} disabled={formData.mode === "online"} placeholder={formData.mode === "online" ? "N/A" : "e.g. Dhaka"} />
          </div>
          <Input id="venue" label="Venue" value={formData.venue} onChange={handleChange} className="mt-4" disabled={formData.mode === "online"} placeholder={formData.mode === "online" ? "Online Platform Link will be provided" : "e.g. BUET ECE Building"} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Registration & Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input id="registrationDeadline" type="date" label="Registration Deadline" required value={formData.registrationDeadline} onChange={handleChange} />
            <Input id="registrationFee" label="Registration Fee" required value={formData.registrationFee} onChange={handleChange} placeholder="e.g. Free, or ৳500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input id="teamSize" label="Team Size" required value={formData.teamSize} onChange={handleChange} placeholder="e.g. 1-3 members" />
            <Input id="availableSeats" type="number" label="Available Seats (Optional)" value={formData.availableSeats} onChange={handleChange} placeholder="e.g. 100" />
          </div>
          
          <Input id="eligibility" label="Eligibility" required value={formData.eligibility} onChange={handleChange} className="mb-4" placeholder="e.g. University students only" />
          <Textarea id="rules" label="Rules & Guidelines (Optional)" value={formData.rules} onChange={handleChange} rows={3} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Links & Additional Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input id="prizePool" label="Prize Pool (Optional)" value={formData.prizePool} onChange={handleChange} placeholder="e.g. ৳50,000 Total" />
            <Input id="certificateInfo" label="Certificate Info (Optional)" value={formData.certificateInfo} onChange={handleChange} placeholder="e.g. Yes, for all participants" />
          </div>
          <Textarea id="contactInfo" label="Contact Information" required value={formData.contactInfo} onChange={handleChange} rows={2} placeholder="Email, phone number, or social links for support" className="mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="registrationLink" type="url" label="Registration Link" required value={formData.registrationLink} onChange={handleChange} placeholder="https://..." />
            <Input id="officialWebsite" type="url" label="Official Website (Optional)" value={formData.officialWebsite} onChange={handleChange} placeholder="https://..." />
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Event for Review"}
          </Button>
        </div>
      </form>
    </div>
  );
}
