import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { footerNav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-surface">
      <Container className="py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">{site.tagline}</p>
            <p className="mt-3 text-xs leading-relaxed text-faint">
              {site.aurexAttribution}
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2">
            {footerNav.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/70 pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}.</p>
          <p>Built by Hasan Shahid.</p>
        </div>
      </Container>
    </footer>
  );
}
