"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Message, Chat } from "@/types";
import { removeMessageWithAssistantReply } from "@/lib/chat-history";

export function useChat(characterId: string | string[] | undefined) {
  const { status } = useSession();
  const router = useRouter();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [rollBackState, setRollBackState] = useState<{ id: number; content: string } | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [chatError, setChatError] = useState<{ message: string; rawError?: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [activeMenuId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const initChat = async () => {
      if (!characterId) return;
      try {
        const chatRes = await fetch(`/api/chats/${characterId}`);
        if (!chatRes.ok) throw new Error("Failed to load chat");
        const chatData = await chatRes.json();
        setChat(chatData);

        const msgRes = await fetch(`/api/messages?chatId=${chatData.id}`);
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          if (msgData.length === 0 && chatData.character.greeting) {
            setMessages([
              {
                id: 0,
                role: "assistant",
                content: chatData.character.greeting,
                createdAt: new Date().toISOString(),
              },
            ]);
          } else {
            setMessages(msgData);
          }
        }
      } catch (error) {
        console.error("Chat Init Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      initChat();
    }
  }, [status, characterId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !chat || isSending) return;

    const userMessage = inputValue;
    setInputValue("");
    setIsSending(true);
    setChatError(null);

    const tempUserMsg: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chat.id,
          content: userMessage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          setChatError({ message: data.message, rawError: data.rawError });
          setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
          setInputValue(userMessage);
        } else {
          setMessages((prev) => [
            ...prev.filter((m) => m.id !== tempUserMsg.id),
            data.userMessage,
            data.aiMessage,
          ]);
        }
      } else {
        const errData = await res.json().catch(() => null);
        setChatError({
          message:
            errData?.message ||
            "Failed to communicate with AI model. Please verify your provider/model settings.",
          rawError: errData?.rawError,
        });
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        setInputValue(userMessage);
      }
    } catch (error) {
      console.error("Send Error:", error);
      setChatError({ message: "Network error while reaching AI service." });
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      setInputValue(userMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => removeMessageWithAssistantReply(prev, id));
      }
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  const handleEdit = async (id: number) => {
    if (!editValue.trim()) return;
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editValue }),
      });
      if (res.ok) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: editValue } : m)));
        setEditingMessageId(null);
      }
    } catch (error) {
      console.error("Edit Error:", error);
    }
  };

  const handleReroll = async (msgId: number) => {
    if (isSending || !chat) return;

    const aiMsg = messages.find((m) => m.id === msgId);
    if (!aiMsg) return;

    setRollBackState({ id: aiMsg.id, content: aiMsg.content });

    setIsSending(true);
    setChatError(null);
    try {
      const msgIndex = messages.findIndex((m) => m.id === msgId);
      const userPrompt = messages[msgIndex - 1]?.content;
      if (!userPrompt) throw new Error("No prompt found for re-roll");

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chat.id,
          content: userPrompt,
          isReroll: true,
          oldAiMessageId: aiMsg.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          setChatError({ message: data.message, rawError: data.rawError });
        } else {
          setMessages((prev) => prev.map((m) => (m.id === msgId ? data.aiMessage : m)));
        }
      } else {
        const errData = await res.json().catch(() => null);
        setChatError({
          message: errData?.message || "Failed to re-roll message. Model might be overloaded.",
          rawError: errData?.rawError,
        });
      }
    } catch (error) {
      console.error("Reroll Error:", error);
      setChatError({ message: "Network error during re-roll." });
    } finally {
      setIsSending(false);
    }
  };

  const handleUndoReroll = async () => {
    if (!rollBackState || !chat) return;
    try {
      const res = await fetch(`/api/messages/${rollBackState.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: rollBackState.content }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === rollBackState.id ? { ...m, content: rollBackState.content } : m
          )
        );
        setRollBackState(null);
      }
    } catch (error) {
      console.error("Undo Error:", error);
    }
  };

  const handleResend = async (id: number) => {
    if (isSending || !chat) return;
    const userMsg = messages.find((m) => m.id === id);
    if (!userMsg) return;

    setInputValue("");
    setIsSending(true);
    setChatError(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chat.id,
          content: userMsg.content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          setChatError({ message: data.message, rawError: data.rawError });
          setInputValue(userMsg.content);
        } else {
          setMessages((prev) => [...prev, data.aiMessage]);
        }
      } else {
        const errData = await res.json().catch(() => null);
        setChatError({
          message: errData?.message || "Failed to resend message.",
          rawError: errData?.rawError,
        });
        setInputValue(userMsg.content);
      }
    } catch (error) {
      console.error("Resend Error:", error);
      setChatError({ message: "Network error during resend." });
      setInputValue(userMsg.content);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateArchive = async (archiveId: number | null) => {
    if (!chat || !characterId) return;
    try {
      const res = await fetch(`/api/chats/${characterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archiveId }),
      });
      if (res.ok) {
        const updatedChat = await res.json();
        setChat(updatedChat);
      }
    } catch (error) {
      console.error("Update Archive Error:", error);
    }
  };

  const handleResetChat = async () => {
    if (!chat || !characterId || isSending || isResetting) return false;

    setIsResetting(true);
    setChatError(null);

    try {
      const res = await fetch(`/api/chats/${characterId}`, { method: "DELETE" });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setChatError({
          message: errorData?.message || "Failed to reset chat history.",
        });
        return false;
      }

      setMessages(
        chat.character.greeting
          ? [
              {
                id: 0,
                role: "assistant",
                content: chat.character.greeting,
                createdAt: new Date().toISOString(),
              },
            ]
          : []
      );
      setEditingMessageId(null);
      setEditValue("");
      setRollBackState(null);
      setActiveMenuId(null);
      setInputValue("");
      return true;
    } catch (error) {
      console.error("Reset Chat Error:", error);
      setChatError({ message: "Network error while resetting chat history." });
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  return {
    chat,
    messages,
    inputValue,
    setInputValue,
    isLoading: status === "loading" || isLoading,
    isSending,
    isResetting,
    editingMessageId,
    setEditingMessageId,
    editValue,
    setEditValue,
    rollBackState,
    setRollBackState,
    activeMenuId,
    setActiveMenuId,
    chatError,
    setChatError,
    messagesEndRef,
    handleSendMessage,
    handleDelete,
    handleEdit,
    handleReroll,
    handleUndoReroll,
    handleResend,
    handleUpdateArchive,
    handleResetChat,
  };
}
