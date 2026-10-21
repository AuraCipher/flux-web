import Link from "next/link";

/**
 * The Flux brand lockup: the actual Flux mark (copied from the project's logo
 * assets) paired with the wordmark set in the brand display font and the
 * Instagram-style gradient used across the app.
 */
export function Logo({
  mark = "/flux-mark-white.png",
  className = "",
  href = "/",
}: {
  mark?: string;
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Flux home"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mark}
        alt=""
        aria-hidden="true"
        className="h-7 w-7 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105"
      />
      <span className="font-display text-xl font-extrabold tracking-tight text-gradient">
        flux
      </span>
    </Link>
  );
}
