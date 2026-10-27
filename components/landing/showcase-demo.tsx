"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type Sender = "me" | "them" | "system";

type Bubble = {
  id: string;
  sender: Sender;
  content: string;
  time: string;
  name?: string;
  read?: boolean;
};

type Convo = {
  id: string;
  name: string;
  isGroup: boolean;
  members: number | null;
  tileTime: string;
  unread: number;
  messages: Bubble[];
  reply: string;
  replyName?: string;
};

const INITIAL_CONVOS: Convo[] = [
  {
    id: "group",
    name: "Design Crew",
    isGroup: true,
    members: 4,
    tileTime: "11:32 AM",
    unread: 2,
    reply: "haha it keeps getting better each build 😄",
    replyName: "Chen Wei",
    messages: [
      { id: "g-0", sender: "system", content: "Ayesha added Chen Wei", time: "11:30 AM" },
      { id: "g-1", sender: "them", name: "Ayesha Khan", content: "Welcome Chen 👋", time: "11:30 AM" },
      { id: "g-2", sender: "me", content: "Hey, welcome!", time: "11:31 AM", read: true },
      {
        id: "g-3",
        sender: "them",
        name: "Chen Wei",
        content: "Thanks! Been testing the app all morning",
        time: "11:31 AM",
      },
      {
        id: "g-4",
        sender: "them",
        name: "Chen Wei",
        content: "The gradient rings are so clean 🤩",
        time: "11:31 AM",
      },
      {
        id: "g-5",
        sender: "them",
        name: "Bilal Ahmed",
        content: "Wait till you see voice messages 👀",
        time: "11:32 AM",
      },
    ],
  },
  {
    id: "ayesha",
    name: "Ayesha Khan",
    isGroup: false,
    members: null,
    tileTime: "9:42 AM",
    unread: 2,
    reply: "Adding it to my daily workflow ✅",
    messages: [
      { id: "a-1", sender: "me", content: "Are you seeing the offline sync? 🤯", time: "9:40 AM", read: true },
      { id: "a-2", sender: "them", content: "I'm literally using it on the metro right now", time: "9:42 AM" },
      { id: "a-3", sender: "them", content: "No wifi and it just works", time: "9:42 AM" },
    ],
  },
  {
    id: "bilal",
    name: "Bilal Ahmed",
    isGroup: false,
    members: null,
    tileTime: "8:15 AM",
    unread: 0,
    reply: "Deal 🤝",
    messages: [
      { id: "b-1", sender: "me", content: "Ship the group invites first?", time: "8:12 AM", read: true },
      { id: "b-2", sender: "them", content: "That sounds good. Let's do it tomorrow.", time: "8:15 AM" },
    ],
  },
  {
    id: "chen",
    name: "Chen Wei",
    isGroup: false,
    members: null,
    tileTime: "7:20 PM",
    unread: 0,
    reply: "Bring the new strat 🕹️",
    messages: [
      { id: "c-1", sender: "them", content: "GGs last night 🎮", time: "7:18 PM" },
      { id: "c-2", sender: "them", content: "You're cracking the top 100 this season", time: "7:20 PM" },
    ],
  },
  {
    id: "dana",
    name: "Dana Ali",
    isGroup: false,
    members: null,
    tileTime: "6:12 PM",
    unread: 1,
    reply: "So what are we coding next 👩‍💻",
    messages: [
      { id: "d-1", sender: "me", content: "No stress if you're busy today", time: "6:10 PM", read: true },
      { id: "d-2", sender: "them", content: "No worries, take your time.", time: "6:12 PM" },
    ],
  },
  {
    id: "emir",
    name: "Emir Yilmaz",
    isGroup: false,
    members: null,
    tileTime: "4:38 PM",
    unread: 0,
    reply: "Metrics look way better now 📊",
    messages: [
      { id: "e-1", sender: "me", content: "Sent you the redesign files", time: "4:35 PM", read: true },
      { id: "e-2", sender: "them", content: "The design looks great!", time: "4:38 PM" },
    ],
  },
];

const TYPING_MS = 700;
const REPLY_MS = 2400;

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </Icon>
  );
}

function AiIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M12 3l1.9 5.7a2 2 0 0 0 1.3 1.3L21 12l-5.8 2a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.7a2 2 0 0 0-1.3-1.3L3 12l5.8-2a2 2 0 0 0 1.3-1.3L12 3z" />
    </Icon>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </Icon>
  );
}

function AxIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <rect x="5" y="8" width="14" height="12" rx="3" />
      <path d="M12 8V4m-5 2-1.5-2m13 2L20 4" />
      <circle cx="9.5" cy="13" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13" r="0.5" fill="currentColor" stroke="none" />
    </Icon>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
    </Icon>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </Icon>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </Icon>
  );
}

function TickIcon({ read, className }: { read: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {read ? (
        <>
          <path d="M18 6 7 17l-5-5" />
          <path d="m22 10-7.5 7.5L13 16" />
        </>
      ) : (
        <path d="M20 6 9 17l-5-5" />
      )}
    </svg>
  );
}

function lastPreview(convo: Convo): string {
  for (let i = convo.messages.length - 1; i >= 0; i -= 1) {
    const m = convo.messages[i];
    if (m.sender === "system") continue;
    return convo.isGroup && m.name ? `${m.name}: ${m.content}` : m.content;
  }
  return "";
}

function Ticks({ read }: { read: boolean }) {
  return (
    <span className="flex items-center" aria-label={read ? "Read" : "Sent"}>
      <TickIcon
        read={read}
        className={`h-3.5 w-3.5 ${read ? "text-accent" : "text-[#5C5C5C]"}`}
      />
    </span>
  );
}

function TypingIndicator() {
  return (
    <div className="ml-3 mr-15 mt-2 flex flex-col items-start" aria-label="Typing…">
      <div className="flex items-center gap-1 rounded-[18px_18px_18px_4px] bg-card px-4 py-3">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#5C5C5C] motion-reduce:animate-none" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#5C5C5C] [animation-delay:150ms] motion-reduce:animate-none" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#5C5C5C] [animation-delay:300ms] motion-reduce:animate-none" />
      </div>
    </div>
  );
}

function MessageRow({
  convo,
  bubble,
  isConsecutive,
}: {
  convo: Convo;
  bubble: Bubble;
  isConsecutive: boolean;
}) {
  const mine = bubble.sender === "me";
  return (
    <div
      className={`${mine ? "ml-15 mr-3" : "ml-3 mr-15"} ${
        isConsecutive ? "mt-0.5" : "mt-2"
      } flex flex-col ${mine ? "items-end" : "items-start"}`}
    >
      {convo.isGroup && !mine && !isConsecutive ? (
        <span className="pb-1 pl-1 text-xs font-semibold text-accent">
          {bubble.name ?? convo.name}
        </span>
      ) : null}
      <div
        className={`px-3.5 py-2.5 text-[15px] leading-snug ${
          mine
            ? "rounded-[18px_18px_4px_18px] bg-accent text-white"
            : "rounded-[18px_18px_18px_4px] bg-card text-[#F5F5F5]"
        }`}
      >
        {bubble.content}
      </div>
      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#5C5C5C]">
        <span>{bubble.time}</span>
        {mine ? <Ticks read={Boolean(bubble.read)} /> : null}
      </div>
    </div>
  );
}

function SystemBubble({ text }: { text: string }) {
  return (
    <div className="my-2 flex justify-center px-4">
      <div className="rounded-xl bg-[#1A1A1A] px-3 py-1 text-center text-xs text-[#5C5C5C]">
        {text}
      </div>
    </div>
  );
}

export function ShowcaseDemo() {
  const [convos, setConvos] = useState<Convo[]>(INITIAL_CONVOS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [typingIn, setTypingIn] = useState<string | null>(null);
  const timersRef = useRef<number[]>([]);
  const activeIdRef = useRef<string | null>(null);
  const idCounterRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  useEffect(() => {
    if (activeId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeId]);

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  });

  const active = activeId ? convos.find((c) => c.id === activeId) ?? null : null;
  const normalizedQuery = query.trim().toLowerCase();
  const visibleConvos = normalizedQuery
    ? convos.filter((c) => c.name.toLowerCase().includes(normalizedQuery))
    : convos;

  function openChat(id: string) {
    activeIdRef.current = id;
    setActiveId(id);
    setTypingIn(null);
    setConvos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  }

  function goBack() {
    activeIdRef.current = null;
    setActiveId(null);
    setDraft("");
  }

  function handleSend(event: FormEvent) {
    event.preventDefault();
    const id = activeId;
    const content = draft.trim();
    if (!id || !content) return;

    const mineId = `m-${(idCounterRef.current += 1)}`;
    setConvos((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              tileTime: "now",
              messages: [
                ...c.messages,
                { id: mineId, sender: "me", content, time: "now", read: false },
              ],
            }
          : c
      )
    );
    setDraft("");

    timersRef.current.push(
      window.setTimeout(() => {
        setConvos((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === mineId ? { ...m, read: true } : m
                  ),
                }
              : c
          )
        );
        setTypingIn(id);
      }, TYPING_MS)
    );

    const replyId = `r-${(idCounterRef.current += 1)}`;
    timersRef.current.push(
      window.setTimeout(() => {
        setTypingIn((cur) => (cur === id ? null : cur));
        setConvos((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c;
            const stillActive = activeIdRef.current === c.id;
            return {
              ...c,
              tileTime: "now",
              unread: c.unread + (stillActive ? 0 : 1),
              messages: [
                ...c.messages,
                {
                  id: replyId,
                  sender: "them",
                  content: c.reply,
                  time: "now",
                  name: c.isGroup ? c.replyName : undefined,
                },
              ],
            };
          })
        );
      }, REPLY_MS)
    );
  }

  function handleReset() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    activeIdRef.current = null;
    setConvos(INITIAL_CONVOS);
    setActiveId(null);
    setDraft("");
    setQuery("");
    setTypingIn(null);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[400px] overflow-hidden rounded-[42px] border border-border bg-black shadow-2xl shadow-black/70">
        <div className="flex h-[640px] flex-col">
          {active ? (
            <>
              <header className="flex h-14 shrink-0 items-center gap-2 border-b border-card px-1">
                <button
                  type="button"
                  onClick={goBack}
                  aria-label="Back to conversations"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#F5F5F5] hover:bg-elevated focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <BackIcon className="h-6 w-6" />
                </button>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] text-[#5C5C5C]">
                  {active.isGroup ? (
                    <UsersIcon className="h-4 w-4" />
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-base font-semibold text-[#F5F5F5]">
                    {active.name}
                  </div>
                  {active.isGroup && active.members !== null ? (
                    <div className="text-xs text-[#5C5C5C]">
                      {active.members} members
                    </div>
                  ) : null}
                </div>
              </header>

              <div
                ref={listRef}
                role="log"
                aria-label={`Messages with ${active.name}`}
                className="flex-1 overflow-y-auto py-2"
              >
                {active.messages.map((m, i) => {
                  const prev = i > 0 ? active.messages[i - 1] : undefined;
                  const isConsecutive =
                    Boolean(prev) &&
                    prev!.sender === m.sender &&
                    prev!.name === m.name &&
                    m.sender !== "system" &&
                    prev!.sender !== "system";
                  if (m.sender === "system") {
                    return <SystemBubble key={m.id} text={m.content} />;
                  }
                  return (
                    <MessageRow
                      key={m.id}
                      convo={active}
                      bubble={m}
                      isConsecutive={isConsecutive}
                    />
                  );
                })}
                {typingIn === active.id ? <TypingIndicator /> : null}
              </div>

              <form
                onSubmit={handleSend}
                className="flex shrink-0 items-center gap-2 border-t border-card bg-[#0D0D0D] px-3 py-2"
              >
                <label htmlFor="demo-message" className="sr-only">
                  Message
                </label>
                <input
                  id="demo-message"
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Message…"
                  className="min-w-0 flex-1 rounded-[24px] bg-[#1A1A1A] px-4 py-2.5 text-[15px] text-[#F5F5F5] placeholder:text-[#5C5C5C] focus-visible:outline-2 focus-visible:outline-accent"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white disabled:opacity-40"
                >
                  <SendIcon className="h-4.5 w-4.5" />
                </button>
              </form>
            </>
          ) : (
            <>
              <header className="relative flex h-14 shrink-0 items-center justify-center">
                <span className="text-[26px] font-bold tracking-[-0.04em] text-gradient">
                  flux
                </span>
                <button
                  type="button"
                  disabled
                  title="Demo: only chats are interactive"
                  aria-label="Notifications (not available in demo)"
                  className="absolute right-1 flex h-10 w-10 items-center justify-center text-[#F5F5F5]"
                >
                  <span className="relative">
                    <HeartIcon className="h-6 w-6" />
                    <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF3040] px-0.5 text-[10px] font-bold text-white">
                      3
                    </span>
                  </span>
                </button>
              </header>

              <div className="relative flex min-h-0 flex-1 flex-col">
                <div className="shrink-0 px-4 pb-1 pt-2">
                  <label htmlFor="demo-search" className="sr-only">
                    Search conversations
                  </label>
                  <div className="flex items-center gap-2 rounded-md border border-[#262626] bg-card px-3 py-2 transition-colors focus-within:border-[#A8A8A8]">
                    <SearchIcon className="h-4 w-4 shrink-0 text-[#A8A8A8]" />
                    <input
                      id="demo-search"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search conversations"
                      className="w-full bg-transparent text-sm text-[#F5F5F5] placeholder:text-[#A8A8A8] focus-visible:outline-none"
                    />
                  </div>
                </div>
                <ul className="min-h-0 flex-1 overflow-y-auto">
                  {visibleConvos.map((c, i, all) => {
                    const preview = lastPreview(c);
                    const unread = c.unread > 0;
                    return (
                      <Fragment key={c.id}>
                        <li>
                          <button
                          type="button"
                          onClick={() => openChat(c.id)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-elevated focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          <span className="relative shrink-0">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A1A1A] text-[#5C5C5C]">
                              {c.isGroup ? (
                                <UsersIcon className="h-7 w-7" />
                              ) : (
                                <UserIcon className="h-7 w-7" />
                              )}
                            </span>
                            {c.isGroup ? (
                              <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                                <UsersIcon className="h-2.5 w-2.5" />
                              </span>
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-baseline justify-between gap-2">
                              <span
                                className={`truncate text-[15px] text-[#F5F5F5] ${
                                  unread ? "font-bold" : "font-medium"
                                }`}
                              >
                                {c.name}
                              </span>
                              <span
                                className={`shrink-0 text-xs ${
                                  unread ? "text-accent" : "text-[#5C5C5C]"
                                }`}
                              >
                                {c.tileTime}
                              </span>
                            </span>
                            <span className="mt-0.5 flex items-center justify-between gap-2">
                              <span
                                className={`truncate text-[13px] ${
                                  unread ? "text-[#A8A8A8]" : "text-[#5C5C5C]"
                                }`}
                              >
                                {preview}
                              </span>
                              {unread ? (
                                <span
                                  aria-label={`${c.unread} unread messages`}
                                  className="shrink-0 rounded-[10px] bg-accent px-1.5 py-0.5 text-[11px] font-bold leading-none text-white"
                                >
                                  {c.unread > 99 ? "99+" : c.unread}
                                </span>
                              ) : null}
                            </span>
                          </span>
                        </button>
                      </li>
                        {i < all.length - 1 ? (
                          <li
                            aria-hidden="true"
                            className="ml-[76px] h-px bg-card"
                          />
                        ) : null}
                      </Fragment>
                    );
                  })}
                  {visibleConvos.length === 0 ? (
                    <li>
                      <div
                        role="status"
                        className="flex flex-col items-center gap-1 px-4 py-10 text-center"
                      >
                        <p className="text-[15px] font-semibold text-[#F5F5F5]">
                          No conversations found
                        </p>
                        <p className="text-[13px] text-[#5C5C5C]">
                          Try a different name.
                        </p>
                        <button
                          type="button"
                          onClick={() => setQuery("")}
                          className="mt-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-accent hover:bg-elevated focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          Clear search
                        </button>
                      </div>
                    </li>
                  ) : null}
                </ul>
                <button
                  type="button"
                  onClick={() => openChat("group")}
                  title="Demo: opens the group chat"
                  className="absolute bottom-5 right-4 flex items-center gap-2 rounded-2xl bg-[#1A1A1A] px-4 py-3 text-[13px] font-semibold text-accent shadow-lg hover:bg-card focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <UsersIcon className="h-5 w-5" />
                  New Group
                </button>
              </div>

              <nav
                aria-label="Demo bottom navigation"
                className="flex h-14 shrink-0 items-center justify-around border-t border-card"
              >
                <span
                  title="Chats"
                  className="flex h-full w-14 cursor-default items-center justify-center text-[#F5F5F5]"
                >
                  <HomeIcon className="h-6 w-6" />
                </span>
                {[
                  { label: "AI tab (not available in demo)", icon: <AiIcon className="h-6 w-6" /> },
                  { label: "Search tab (not available in demo)", icon: <SearchIcon className="h-6 w-6" /> },
                  { label: "Ax tab (not available in demo)", icon: <AxIcon className="h-6 w-6" /> },
                  { label: "Profile tab (not available in demo)", icon: <UserIcon className="h-6 w-6" /> },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    disabled
                    title="Demo: only chats are interactive"
                    aria-label={tab.label}
                    className="flex h-full w-14 items-center justify-center text-[#5C5C5C]"
                  >
                    {tab.icon}
                  </button>
                ))}
              </nav>
            </>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-faint">
        Simulated demo — real Flux interface, fake data. Messages stay in your browser.
      </p>
      <button
        type="button"
        onClick={handleReset}
        className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-elevated focus-visible:outline-2 focus-visible:outline-accent"
      >
        Reset demo
      </button>
    </div>
  );
}
