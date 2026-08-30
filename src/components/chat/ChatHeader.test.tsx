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
      systemPrompt: "You are a test character",
    },
  };

  it("renders the character identity and back navigation", () => {
    render(
      <ChatHeader chat={chat} onUpdateArchive={vi.fn()} onResetChat={vi.fn()} isResetting={false} />
    );

    expect(screen.getByRole("heading", { name: "Mira" })).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/characters");
  });

  it("passes archive updates from the selector", async () => {
    const user = userEvent.setup();
    const onUpdateArchive = vi.fn();

    render(
      <ChatHeader
        chat={chat}
        onUpdateArchive={onUpdateArchive}
        onResetChat={vi.fn()}
        isResetting={false}
      />
    );

    await user.click(screen.getByRole("button", { name: "Archive 3" }));

    expect(onUpdateArchive).toHaveBeenCalledWith(null);
  });

  it("requires confirmation before resetting the chat", async () => {
    const user = userEvent.setup();
    const onResetChat = vi.fn().mockResolvedValue(true);

    render(
      <ChatHeader
        chat={chat}
        onUpdateArchive={vi.fn()}
        onResetChat={onResetChat}
        isResetting={false}
      />
    );

    await user.click(screen.getByRole("button", { name: "Reset chat history" }));

    expect(onResetChat).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Reset this chat?" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete all messages" }));

    expect(onResetChat).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog", { name: "Reset this chat?" })).not.toBeInTheDocument();
  });

  it("keeps the confirmation open when resetting fails", async () => {
    const user = userEvent.setup();

    render(
      <ChatHeader
        chat={chat}
        onUpdateArchive={vi.fn()}
        onResetChat={vi.fn().mockResolvedValue(false)}
        isResetting={false}
      />
    );

    await user.click(screen.getByRole("button", { name: "Reset chat history" }));
    await user.click(screen.getByRole("button", { name: "Delete all messages" }));

    expect(screen.getByRole("dialog", { name: "Reset this chat?" })).toBeInTheDocument();
  });
});
