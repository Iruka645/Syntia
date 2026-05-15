import type { Message } from "@/types";

export function removeMessageWithAssistantReply(messages: Message[], id: number): Message[] {
  const messageIndex = messages.findIndex((message) => message.id === id);

  if (messageIndex === -1) {
    return messages;
  }

  const messageToDelete = messages[messageIndex];
  const deleteCount =
    messageToDelete.role === "user" && messages[messageIndex + 1]?.role === "assistant" ? 2 : 1;

  return [...messages.slice(0, messageIndex), ...messages.slice(messageIndex + deleteCount)];
}
