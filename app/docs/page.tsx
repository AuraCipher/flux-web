import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { PlaceholderPage } from "@/components/landing/placeholder-page";

export const metadata: Metadata = {
  title: "Documentation",
};

export default function DocsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <PlaceholderPage eyebrow="Coming soon" title="Documentation">
          <p>
            Public documentation for Flux is being prepared. Guides for getting
            started, features, and account management will live here.
          </p>
        </PlaceholderPage>
      </main>
      <SiteFooter />
    </>
  );
}
