import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShowcaseDemo } from "@/components/landing/showcase-demo";

describe("<ShowcaseDemo />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function getList() {
    return screen.getByRole("log", { hidden: false });
  }

  function getTile(name: string): HTMLElement {
    const tiles = screen
      .getAllByRole("button", { hidden: true })
      .filter((b) => (b.textContent ?? "").startsWith(name));
    expect(tiles).toHaveLength(1);
    return tiles[0];
  }

  it("renders the conversation list with all six conversations and unread badges", () => {
    render(<ShowcaseDemo />);

    for (const name of [
      "Design Crew",
      "Ayesha Khan",
      "Bilal Ahmed",
      "Chen Wei",
      "Dana Ali",
      "Emir Yilmaz",
    ]) {
      expect(getTile(name)).toBeTruthy();
    }

    expect(screen.getAllByLabelText("2 unread messages")).toHaveLength(2);
    expect(screen.getByLabelText("1 unread messages")).toBeTruthy();
    expect(screen.getByRole("button", { name: /New Group/ })).toBeTruthy();
  });

  it("opens a 1:1 chat, marks it read, and shows the composer", () => {
    render(<ShowcaseDemo />);

    fireEvent.click(getTile("Ayesha Khan"));

    const log = getList();
    expect(screen.getByRole("log", { name: /Messages with Ayesha Khan/ })).toBeTruthy();
    expect(within(log).getByText("Are you seeing the offline sync? 🤯")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Back to conversations" }));

    const tile = getTile("Ayesha Khan");
    expect(tile.querySelector('[aria-label$="unread messages"]')).toBeNull();
  });

  it("shows group sender names, members subtitle and system message in group chat", () => {
    render(<ShowcaseDemo />);

    fireEvent.click(screen.getByRole("button", { name: /Design Crew/ }));

    expect(screen.getByText(/4 members/)).toBeTruthy();
    expect(screen.getByText("Ayesha added Chen Wei")).toBeTruthy();
    expect(screen.getByText("Ayesha Khan")).toBeTruthy();
    expect(screen.getByText("Bilal Ahmed")).toBeTruthy();
    expect(within(getList()).getByText("Wait till you see voice messages 👀")).toBeTruthy();
  });

  it("sends a message, shows typing, then a deterministic reply", async () => {
    render(<ShowcaseDemo />);

    fireEvent.click(getTile("Bilal Ahmed"));
    const input = screen.getByLabelText("Message") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Sounds good to me" } });
    expect((screen.getByRole("button", { name: "Send message" }) as HTMLButtonElement).disabled).toBe(false);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    });

    const log = getList();
    expect(within(log).getByText("Sounds good to me")).toBeTruthy();
    expect(input.value).toBe("");

    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getByLabelText("Typing…")).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(1800);
    });
    expect(within(log).getByText("Deal 🤝")).toBeTruthy();
    expect(screen.queryByLabelText("Typing…")).toBeNull();
  });

  it("cannot send an empty or whitespace-only message", () => {
    render(<ShowcaseDemo />);

    fireEvent.click(screen.getByRole("button", { name: /Emir Yilmaz/ }));
    const send = screen.getByRole("button", { name: "Send message" }) as HTMLButtonElement;
    expect(send.disabled).toBe(true);

    const input = screen.getByLabelText("Message");
    fireEvent.change(input, { target: { value: "   " } });
    expect(send.disabled).toBe(true);
    expect(within(getList()).queryByText("The design looks great!")).toBeTruthy();
    expect(within(getList()).queryByText("   ")).toBeNull();
  });

  it("delivers a pending reply with an unread badge after navigating back", async () => {
    render(<ShowcaseDemo />);

    fireEvent.click(getTile("Dana Ali"));
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "No rush at all" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    });

    await act(async () => {
      vi.advanceTimersByTime(900);
    });
    fireEvent.click(screen.getByRole("button", { name: "Back to conversations" }));

    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    const tile = within(getTile("Dana Ali"));
    expect(tile.getByText("So what are we coding next 👩‍💻")).toBeTruthy();
    expect(tile.getByLabelText("1 unread messages")).toBeTruthy();
    expect(tile.getByText("now")).toBeTruthy();
  });

  it("restores the initial state when Reset demo is clicked", async () => {
    render(<ShowcaseDemo />);

    fireEvent.click(getTile("Bilal Ahmed"));
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "Half a draft" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    });
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Reset demo" }));
    });

    expect(screen.getByRole("button", { name: /Dana Ali/ })).toBeTruthy();
    expect(
      within(getTile("Ayesha Khan")).getByLabelText("2 unread messages")
    ).toBeTruthy();
    expect(screen.queryByRole("log")).toBeNull();
  });

  it("filters contacts by name as you type, with no network activity", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<ShowcaseDemo />);

    fireEvent.change(screen.getByLabelText("Search conversations"), {
      target: { value: "bilal" },
    });

    expect(getTile("Bilal Ahmed")).toBeTruthy();
    expect(screen.queryByText("Ayesha Khan")).toBeNull();
    expect(screen.queryByText("Chen Wei")).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("matches search terms case-insensitively and ignores surrounding whitespace", () => {
    render(<ShowcaseDemo />);
    const input = screen.getByLabelText("Search conversations") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "  LAL  " } });

    expect(getTile("Bilal Ahmed")).toBeTruthy();
    expect(screen.queryByText("Dana Ali")).toBeNull();
  });

  it("shows an intentional empty state when no contact matches", () => {
    render(<ShowcaseDemo />);

    fireEvent.change(screen.getByLabelText("Search conversations"), {
      target: { value: "zzz" },
    });

    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByText("No conversations found")).toBeTruthy();
    expect(screen.getByText("Try a different name.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear search" })).toBeTruthy();
    expect(screen.queryByText(/That sounds good/)).toBeNull();
  });

  it("opens the correct conversation from filtered search results", () => {
    render(<ShowcaseDemo />);

    fireEvent.change(screen.getByLabelText("Search conversations"), {
      target: { value: "dana" },
    });
    fireEvent.click(getTile("Dana Ali"));

    expect(screen.getByRole("log", { name: /Messages with Dana Ali/ })).toBeTruthy();
    expect(within(getList()).getByText("No worries, take your time.")).toBeTruthy();
  });

  it("restores the full contact list when the search is cleared", () => {
    render(<ShowcaseDemo />);

    fireEvent.change(screen.getByLabelText("Search conversations"), {
      target: { value: "zzz" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    for (const name of [
      "Design Crew",
      "Ayesha Khan",
      "Bilal Ahmed",
      "Chen Wei",
      "Dana Ali",
      "Emir Yilmaz",
    ]) {
      expect(getTile(name)).toBeTruthy();
    }
    expect(screen.queryByRole("status")).toBeNull();
    expect((screen.getByLabelText("Search conversations") as HTMLInputElement).value).toBe("");
  });
});
