import { FeatureIcon } from "@/components/brand/feature-icon";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { features } from "@/lib/site";

export function Features() {
  return (
    <section id="features" className="bg-surface py-20 sm:py-28" aria-labelledby="features-heading">
      <SectionHeading
        id="features-heading"
        eyebrow="Features"
        title="Everything you need to stay close"
        description="Built around the way people actually talk — fast, focused, and always in reach."
      />

      <Container className="mt-14">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-colors duration-200 hover:border-faint"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-elevated text-accent transition-colors group-hover:text-accent-strong">
                <FeatureIcon name={feature.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-text">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
