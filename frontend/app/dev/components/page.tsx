"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CategoryTag, DeadlineBadge, StatusChip } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
        {title}
      </h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

export default function ComponentShowcase() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-xl font-bold text-neutral-900">Khoj Component Library</h1>
      <p className="mb-8 text-sm text-neutral-600">
        Dev-only page for visually verifying the design system. Not part of the real product.
      </p>

      <Section title="Buttons">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="primary" loading>
          Loading
        </Button>
        <Button variant="primary" disabled>
          Disabled
        </Button>
        <Button variant="primary" size="sm">
          Small
        </Button>
        <Button variant="primary" size="lg">
          Large
        </Button>
      </Section>

      <Section title="Inputs">
        <div className="w-full max-w-sm space-y-4">
          <Input label="Event name" placeholder="e.g. CUET Innovation Hackathon" />
          <Input label="Registration link" placeholder="https://" error="Please enter a valid URL" />
          <Select label="Category" defaultValue="">
            <option value="" disabled>
              Select a category
            </option>
            <option>Hackathon</option>
            <option>Workshop</option>
            <option>Debate Competition</option>
          </Select>
          <Textarea label="Description" placeholder="Describe the event..." hint="Max 500 characters" />
        </div>
      </Section>

      <Section title="Card">
        <Card className="w-full max-w-sm">
          <p className="text-sm text-neutral-900">
            This is a generic Card wrapper used across the app for grouping content.
          </p>
        </Card>
      </Section>

      <Section title="Badges / Chips">
        <CategoryTag label="Hackathon" />
        <DeadlineBadge daysLeft={3} />
        <DeadlineBadge daysLeft={20} />
        <StatusChip status="approved" />
        <StatusChip status="pending" />
        <StatusChip status="rejected" />
      </Section>

      <Section title="Modal">
        <Button onClick={() => setModalOpen(true)}>Open modal</Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Share this event"
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>Copy link</Button>
            </>
          }
        >
          This is placeholder modal content used to verify the Modal component.
        </Modal>
      </Section>
    </div>
  );
}
