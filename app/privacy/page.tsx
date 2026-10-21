import type { Metadata } from "next";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { PlaceholderPage } from "@/components/landing/placeholder-page";

export const metadata: Metadata = {
  title: "Privacy",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <PlaceholderPage eyebrow="Coming soon" title="Privacy">
          <p>
            The Flux privacy policy is not yet published. This page will be
            replaced with the official policy before launch.
          </p>
        </PlaceholderPage>
      </main>
      <SiteFooter />
    </>
  );
}
