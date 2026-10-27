import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ShowcaseDemo } from "@/components/landing/showcase-demo";

export function Showcase() {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="showcase-heading">
      <SectionHeading
        id="showcase-heading"
        eyebrow="Inside Flux"
        title="A messaging home that feels alive"
        description="Your conversations, front and center. Open a chat, send a message, and watch it land — all simulated in your browser."
      />

      <Container className="mt-14">
        <ShowcaseDemo />
      </Container>
    </section>
  );
}
