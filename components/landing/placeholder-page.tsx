import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";

/**
 * A neutral placeholder for routes that are reserved but not yet built.
 * It intentionally performs no authentication, token handling, or data fetching.
 */
export function PlaceholderPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <section className="flex min-h-[70vh] items-center" aria-labelledby="placeholder-heading">
      <Container className="mx-auto max-w-lg text-center">
        <Logo className="justify-center" />
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {eyebrow}
        </p>
        <h1
          id="placeholder-heading"
          className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl"
        >
          {title}
        </h1>
        <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted">
          {children}
        </div>
      </Container>
    </section>
  );
}
