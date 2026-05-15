import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChatHeader } from "./ChatHeader";
import type { Chat } from "@/types";

vi.mock("./ArchiveSelector", () => ({
  default: ({
    currentArchiveId,
    onSelect,
  }: {
    currentArchiveId?: number | null;
    onSelect: (archiveId: number | null) => void;
  }) => (
    <button type="button" onClick={() => onSelect(currentArchiveId ? null : 1)}>
      Archive {currentArchiveId ?? "none"}
    </button>
  ),
}));

describe("ChatHeader", () => {
  const chat: Chat = {
    id: 10,
    archiveId: 3,
    character: {
      id: 1,
      name: "Mira",
      description: "Careful assistant",
      greeting: "Hello",
    },
  };

  it("renders the character identity and back navigation", () => {
    render(<ChatHeader chat={chat} onUpdateArchive={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Mira" })).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/characters");
  });

  it("passes archive updates from the selector", async () => {
    const user = userEvent.setup();
    const onUpdateArchive = vi.fn();

    render(<ChatHeader chat={chat} onUpdateArchive={onUpdateArchive} />);

    await user.click(screen.getByRole("button", { name: "Archive 3" }));

    expect(onUpdateArchive).toHaveBeenCalledWith(null);
  });
});
