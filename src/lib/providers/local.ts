import type { ChatMessage } from "../ai-provider";

const DEFAULT_LOCAL_BASE_URL = "http://127.0.0.1:8000/v1";

export function resolveLocalChatCompletionsUrl(baseUrl?: string): string {
  const configuredUrl =
    baseUrl?.trim() || process.env.LOCAL_AI_BASE_URL?.trim() || DEFAULT_LOCAL_BASE_URL;
  const url = new URL(configuredUrl);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Local provider endpoint must use http:// or https://");
  }

  if (url.username || url.password) {
    throw new Error("Local provider endpoint must not contain credentials");
  }

  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/$/, "");

  if (!url.pathname.endsWith("/chat/completions")) {
    url.pathname = url.pathname.endsWith("/v1")
      ? `${url.pathname}/chat/completions`
      : `${url.pathname}/v1/chat/completions`;
  }

  return url.toString();
}

export async function getLocalResponse(
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  baseUrl?: string
): Promise<string> {
  if (!modelName.trim()) {
    throw new Error("A model name is required for the local provider");
  }

  const maxTokens = Number.parseInt(process.env.MAX_OUTPUT_TOKENS || "800", 10);
  const timeoutMs = Number.parseInt(process.env.LOCAL_AI_TIMEOUT_MS || "120000", 10);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey.trim()) {
    headers.Authorization = `Bearer ${apiKey.trim()}`;
  }

  const response = await fetch(resolveLocalChatCompletionsUrl(baseUrl), {
    method: "POST",
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model: modelName.trim(),
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userMessage },
      ],
      max_tokens: maxTokens,
    }),
  });

  const rawBody = await response.text();
  let data: unknown;

  try {
    data = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data
        ? JSON.stringify((data as { error: unknown }).error)
        : rawBody || response.statusText;
    throw new Error(`Local provider error (${response.status}): ${message}`);
  }

  const content = (data as { choices?: { message?: { content?: unknown } }[] } | null)?.choices?.[0]
    ?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Local provider returned an empty or invalid chat completion");
  }

  return content;
}
