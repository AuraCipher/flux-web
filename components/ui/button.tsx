import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong",
  secondary:
    "border border-border bg-transparent text-text hover:border-faint hover:bg-elevated",
  ghost: "text-muted hover:text-text",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type ButtonLinkProps = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children">;

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  href,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}

type ButtonAnchorProps = CommonProps &
  Omit<ComponentPropsWithoutRef<"a">, "className" | "children" | "href"> & {
    href: string;
  };

/**
 * Anchor styled like a button. Use for non-Next links such as the
 * `flux://` app deep links, which should not be handled by the router.
 */
export function ButtonAnchor({
  variant = "primary",
  className = "",
  children,
  href,
  ...rest
}: ButtonAnchorProps) {
  return (
    <a
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}

type ButtonProps = CommonProps & ComponentPropsWithoutRef<"button">;

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
