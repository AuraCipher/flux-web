import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex justify-center px-5 py-6">
        <Logo />
      </header>

      <main
        id="main"
        className="flex flex-1 items-start justify-center px-5 pb-14 pt-6 sm:items-center sm:pt-0"
      >
        <section className="w-full max-w-md" aria-labelledby="auth-title">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[0_24px_70px_rgba(0,0,0,0.5)] sm:p-8">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--color-grad-1), var(--color-grad-2) 40%, var(--color-grad-3) 72%, var(--color-grad-4))",
              }}
            />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {eyebrow}
            </p>
            <h1
              id="auth-title"
              className="mt-3 font-display text-2xl font-bold tracking-tight text-text sm:text-3xl"
            >
              {title}
            </h1>
            {description ? (
              <div className="mt-3 text-sm leading-relaxed text-muted">
                {description}
              </div>
            ) : null}
            <div className="mt-6">{children}</div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-faint">
            <p>Flux — Real conversations, real people.</p>
            <Link
              href="/"
              className="font-medium text-muted underline-offset-4 hover:text-text hover:underline"
            >
              Back to flux.app
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
