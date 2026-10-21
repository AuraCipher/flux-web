import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { downloadPlatforms } from "@/lib/site";

const statusStyles: Record<string, string> = {
  available: "bg-success/15 text-success border-success/30",
  development: "bg-warning/15 text-warning border-warning/30",
  planned: "bg-elevated text-muted border-border",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  development: "In development",
  planned: "Planned",
};

const platformIcons: Record<string, ReactNode> = {
  Android: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6">
      <path d="M17.6 9.48l1.84-3.18a.38.38 0 0 0-.66-.38l-1.87 3.24a11.4 11.4 0 0 0-9.82 0L5.22 5.92a.38.38 0 0 0-.66.38L6.4 9.48A10.7 10.7 0 0 0 1 18h22a10.7 10.7 0 0 0-5.4-8.52ZM7 15.25a1.25 1.25 0 1 1 1.25-1.25A1.25 1.25 0 0 1 7 15.25Zm10 0a1.25 1.25 0 1 1 1.25-1.25A1.25 1.25 0 0 1 17 15.25Z" />
    </svg>
  ),
  iOS: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6">
      <path d="M17.05 20.28c-.98.95-2.05.86-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
    </svg>
  ),
  Web: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  ),
};

export function Download() {
  return (
    <section id="download" className="py-20 sm:py-28" aria-labelledby="download-heading">
      <SectionHeading
        id="download-heading"
        eyebrow="Download"
        title="Get Flux"
        description="Flux is built for mobile first. Public store releases are on the way — here's where things stand."
      />

      <Container className="mt-14">
        <ul className="grid gap-5 sm:grid-cols-3">
          {downloadPlatforms.map((platform) => (
            <li
              key={platform.name}
              className="flex flex-col rounded-2xl border border-border bg-card p-6"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-elevated text-muted">
                {platformIcons[platform.name]}
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-text">
                {platform.name}
              </h3>
              <span
                className={`mt-3 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[platform.status]}`}
              >
                {statusLabels[platform.status]}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-muted">{platform.note}</p>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="text-sm leading-relaxed text-muted">
            Flux is not yet published on any public app store, and there are no
            download links to share at this time. This page will be updated with
            official links as soon as the app launches.
          </p>
          <p className="mt-3 text-xs text-faint">
            To follow the build, see the{" "}
            <a href="/docs" className="text-accent underline-offset-4 hover:underline">
              documentation
            </a>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}
