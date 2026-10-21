/**
 * Central site configuration for the Flux public website.
 *
 * Keep navigation, feature copy, and download availability in one place so the
 * header, footer, and landing sections never drift apart.
 */

export const site = {
  name: "Flux",
  tagline: "Real conversations, real people.",
  description:
    "Flux is a real-time messaging app for the people who matter — direct messages, group chats, friends, and notifications in one clean, fast place.",
  /**
   * Aurex is the AI companion in Flux, summoned inline via @ai.
   * This mirrors the project's stated identity in the root CLAUDE.md.
   */
  aurexAttribution:
    "Flux is a social messaging app where real people talk and summon Aurex (AI) inline via @ai. Not a chatbot.",
  /** Placeholder until the app is published. No store URLs are invented. */
  appStoreUrl: null as string | null,
} as const;

export type NavLink = {
  label: string;
  href: string;
};

export const primaryNav: NavLink[] = [
  { label: "Features", href: "/#features" },
  { label: "Download", href: "/#download" },
  { label: "Documentation", href: "/docs" },
];

export const footerNav: NavLink[] = [
  { label: "Features", href: "/#features" },
  { label: "Download", href: "/#download" },
  { label: "Documentation", href: "/docs" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

/**
 * Feature claims are limited to capabilities verified in the codebase
 * (backend routes + mobile feature screens). Do not add unverified claims here.
 */
export type Feature = {
  title: string;
  description: string;
  icon: "chat" | "group" | "friends" | "bell" | "search" | "shield";
};

export const features: Feature[] = [
  {
    title: "Real-time messaging",
    description:
      "Messages deliver instantly over WebSocket with a REST fallback, so conversations stay in sync across devices.",
    icon: "chat",
  },
  {
    title: "Direct & group chats",
    description:
      "Start a one-on-one conversation or bring people together in a group with its own members and invites.",
    icon: "group",
  },
  {
    title: "Friends & requests",
    description:
      "Send, accept, or decline friend requests, and manage the people you connect with.",
    icon: "friends",
  },
  {
    title: "User search",
    description:
      "Find people by username quickly and start a conversation without sharing a phone number.",
    icon: "search",
  },
  {
    title: "Notifications",
    description:
      "Stay on top of new messages and activity with in-app notifications and push alerts.",
    icon: "bell",
  },
  {
    title: "Profiles & controls",
    description:
      "Keep your profile current, and control connections with unfriend and block options.",
    icon: "shield",
  },
];

export type DownloadPlatform = {
  name: string;
  /** null means the platform is not yet publicly available. */
  url: string | null;
  status: "available" | "development" | "planned";
  note: string;
};

/**
 * Reflect only what is actually available today. Flux is not yet published on
 * any store, so every platform is honestly labelled as unreleased.
 */
export const downloadPlatforms: DownloadPlatform[] = [
  {
    name: "Android",
    url: null,
    status: "development",
    note: "In development — not yet on Google Play.",
  },
  {
    name: "iOS",
    url: null,
    status: "development",
    note: "In development — not yet on the App Store.",
  },
  {
    name: "Web",
    url: null,
    status: "planned",
    note: "Planned — no public web build yet.",
  },
];
