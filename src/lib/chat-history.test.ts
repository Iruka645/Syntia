import { describe, expect, it } from "vitest";
import { removeMessageWithAssistantReply } from "./chat-history";
import type { Message } from "@/types";

describe("removeMessageWithAssistantReply", () => {
  const messages: Message[] = [
    { id: 1, role: "assistant", content: "Greeting", createdAt: "2026-05-15T00:00:00.000Z" },
    { id: 2, role: "user", content: "Question", createdAt: "2026-05-15T00:01:00.000Z" },
    { id: 3, role: "assistant", content: "Answer", createdAt: "2026-05-15T00:02:00.000Z" },
    { id: 4, role: "user", content: "Another", createdAt: "2026-05-15T00:03:00.000Z" },
  ];

  it("removes a user message together with the following assistant reply", () => {
    expect(removeMessageWithAssistantReply(messages, 2).map((message) => message.id)).toEqual([
      1, 4,
    ]);
  });

  it("removes only the selected assistant message", () => {
    expect(removeMessageWithAssistantReply(messages, 3).map((message) => message.id)).toEqual([
      1, 2, 4,
    ]);
  });

  it("returns the original message list when the id is not found", () => {
    expect(removeMessageWithAssistantReply(messages, 99)).toEqual(messages);
  });
});
