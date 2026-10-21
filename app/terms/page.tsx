import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { PlaceholderPage } from "@/components/landing/placeholder-page";

export const metadata: Metadata = {
  title: "Terms",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <PlaceholderPage eyebrow="Coming soon" title="Terms">
          <p>
            The Flux terms of service are not yet published. This page will be
            replaced with the official terms before launch.
          </p>
        </PlaceholderPage>
      </main>
      <SiteFooter />
    </>
  );
}
