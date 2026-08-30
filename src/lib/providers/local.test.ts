import { afterEach, describe, expect, it, vi } from "vitest";
import { getLocalResponse, resolveLocalChatCompletionsUrl } from "./local";

describe("local AI provider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes API base URLs and full completion endpoints", () => {
    expect(resolveLocalChatCompletionsUrl("http://127.0.0.1:8000/v1")).toBe(
      "http://127.0.0.1:8000/v1/chat/completions"
    );
    expect(resolveLocalChatCompletionsUrl("https://example.test/custom/v1/chat/completions")).toBe(
      "https://example.test/custom/v1/chat/completions"
    );
  });

  it("sends an OpenAI-compatible request without requiring an API key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "Local response" } }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getLocalResponse(
        "",
        "local-model",
        "Stay in character",
        [{ role: "assistant", content: "Hello" }],
        "Hi",
        "http://localhost:8000/v1"
      )
    ).resolves.toBe("Local response");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8000/v1/chat/completions");
    expect(init.headers).not.toHaveProperty("Authorization");
    expect(JSON.parse(String(init.body))).toMatchObject({
      model: "local-model",
      messages: [
        { role: "system", content: "Stay in character" },
        { role: "assistant", content: "Hello" },
        { role: "user", content: "Hi" },
      ],
    });
  });

  it("forwards an optional bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: "Authenticated" } }] }), {
        status: 200,
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await getLocalResponse("secret", "local-model", "Prompt", [], "Hi");

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({ Authorization: "Bearer secret" });
  });
});
