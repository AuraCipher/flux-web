import { Container } from "./container";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  id?: string;
}) {
  const alignment = align === "center" ? "text-center" : "text-left";

  return (
    <Container className={`max-w-2xl ${align === "center" ? "mx-auto" : ""}`}>
      <div className={alignment}>
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-base leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
    </Container>
  );
}
