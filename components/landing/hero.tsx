import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Soft brand glow behind the hero visual */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, #8134af 0%, #dd2a7b 45%, transparent 72%)",
        }}
      />

      <Container className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:gap-8">
        <div className="max-w-xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            Real-time messaging
          </p>

          <h1
            id="hero-heading"
            className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-text sm:text-5xl lg:text-6xl"
          >
            Real conversations, <span className="text-gradient">real people.</span>
          </h1>

          <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
            Flux brings your direct messages, group chats, friends, and notifications
            together in one clean, fast place — so the people who matter are always
            within reach.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/#download">Get the app</ButtonLink>
            <ButtonLink href="/#features" variant="secondary">
              Explore features
            </ButtonLink>
          </div>

          <p className="mt-5 text-xs text-faint">
            Mobile-first. Public store and web releases are coming soon.
          </p>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 scale-110 rounded-full bg-gradient-to-tr from-grad-3/25 via-grad-2/20 to-transparent blur-2xl"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/flux-app-tilt.png"
              alt="Flux mobile app showing the conversations list"
              width={420}
              height={960}
              className="animate-float w-56 max-w-full object-contain drop-shadow-2xl sm:w-64 lg:w-72"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
