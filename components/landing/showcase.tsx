import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * A CSS-built preview of the Flux conversations list, styled with the actual
 * Flux dark theme. It is a design preview — swap `public/flux-app-tilt.png`
 * (or add real screenshots under `public/`) when production screenshots exist.
 */
const conversations = [
  { name: "Ayesha Khan", preview: "Sending over the photos now ✨", time: "9:42 AM", unread: 2 },
  { name: "Bilal Ahmed", preview: "That sounds good. Let's do it tomorrow.", time: "8:15 AM", unread: 0 },
  { name: "Chen Wei", preview: "Perfect — I'll share the files in a bit.", time: "7:20 PM", unread: 0 },
  { name: "Dana Ali", preview: "No worries, take your time.", time: "6:12 PM", unread: 1 },
  { name: "Emir Yilmaz", preview: "The design looks great!", time: "4:38 PM", unread: 0 },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Showcase() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="showcase-heading">
      <SectionHeading
        id="showcase-heading"
        eyebrow="Inside Flux"
        title="A messaging home that feels alive"
        description="Your conversations, front and center. Search, jump back into a thread, and see what's new at a glance."
      />

      <Container className="mt-14">
        <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl shadow-black/60">
          {/* App bar */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="font-display text-lg font-extrabold tracking-tight text-gradient">
              flux
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  className="h-4 w-4 text-faint"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span className="text-sm text-faint">Search conversations</span>
              </div>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-card">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-muted"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
              </svg>
            </span>
          </div>

          {/* Conversation list */}
          <ul className="divide-y divide-border/70">
            {conversations.map((item) => (
              <li
                key={item.name}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-elevated"
              >
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-grad-1 via-grad-2 to-grad-3 text-sm font-bold text-white"
                >
                  {initials(item.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-text">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-xs text-faint">{item.time}</span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted">{item.preview}</span>
                    {item.unread > 0 ? (
                      <span
                        aria-label={`${item.unread} unread messages`}
                        className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white"
                      >
                        {item.unread}
                      </span>
                    ) : null}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {/* Composer hint */}
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2">
              <span className="text-sm text-faint">Message…</span>
              <span className="ml-auto text-faint" aria-hidden="true">➤</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
