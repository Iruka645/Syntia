import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { getChatResponse, AIProvider } from "@/lib/ai-provider";
import { SessionUser } from "@/types";

export async function POST(req: Request) {
  let providerStr = "ai provider";
  let modelStr = "selected model";
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { provider, apiKey: clientApiKey, model, baseUrl } = await req.json();
    if (provider) providerStr = provider;
    if (model) modelStr = model;

    if (!provider) {
      return NextResponse.json({ success: false, error: "Provider is required" }, { status: 400 });
    }

    const userId = parseInt((session.user as SessionUser).id);
    let resolvedApiKey = "";

    // If client provides a new key directly, use it
    if (clientApiKey && !clientApiKey.endsWith("...")) {
      resolvedApiKey = clientApiKey;
    } else {
      // Fetch saved key from DB
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { apiKey: true, defaultProvider: true },
      });

      if (user?.apiKey && user.defaultProvider === provider) {
        try {
          resolvedApiKey = decrypt(user.apiKey);
        } catch (e) {
          console.error("Failed to decrypt API key during test:", e);
        }
      }
    }

    // Fallback to environment variables
    if (!resolvedApiKey) {
      if (provider === "gemini") resolvedApiKey = process.env.GOOGLE_AI_API_KEY || "";
      else if (provider === "openai") resolvedApiKey = process.env.OPENAI_API_KEY || "";
      else if (provider === "claude") resolvedApiKey = process.env.ANTHROPIC_API_KEY || "";
      else if (provider === "grok") resolvedApiKey = process.env.XAI_API_KEY || "";
      else if (provider === "local") resolvedApiKey = process.env.LOCAL_AI_API_KEY || "";
    }

    if (!resolvedApiKey && provider !== "local") {
      return NextResponse.json(
        {
          success: false,
          error: `API Key for ${provider} is missing. Please enter a valid key.`,
        },
        { status: 400 }
      );
    }

    // Resolve model name fallback defaults if empty
    let resolvedModelName = model || "";
    if (!resolvedModelName) {
      if (provider === "gemini") resolvedModelName = "gemini-2.5-flash";
      else if (provider === "openai") resolvedModelName = "gpt-4o";
      else if (provider === "claude") resolvedModelName = "claude-3-5-sonnet-20241022";
      else if (provider === "grok") resolvedModelName = "grok-2-latest";
      else if (provider === "local") resolvedModelName = process.env.LOCAL_AI_MODEL || "";
    }

    const systemPrompt =
      "You are an AI diagnostic assistant. Respond to test pings with a concise confirmation greeting.";
    const userMessage = "Hello";

    // Attempt calling the AI provider
    const responseText = await getChatResponse(
      provider as AIProvider,
      resolvedApiKey,
      resolvedModelName,
      systemPrompt,
      [],
      userMessage,
      baseUrl
    );

    return NextResponse.json({
      success: true,
      message: responseText,
      modelUsed: resolvedModelName,
    });
  } catch (error) {
    console.error("Test Model Error details:", error);

    const errStr = String(error);
    let userAdvice = "An unknown error occurred while communicating with the AI provider.";

    const message = error instanceof Error ? error.message : errStr;

    if (
      errStr.includes("503") ||
      errStr.toLowerCase().includes("high demand") ||
      errStr.toLowerCase().includes("overloaded") ||
      errStr.toLowerCase().includes("service unavailable")
    ) {
      userAdvice = `Model '${modelStr || providerStr}' is currently experiencing high demand/heavy load. Please try selecting a different model or try again later.`;
    } else if (
      errStr.includes("401") ||
      errStr.toLowerCase().includes("unauthorized") ||
      errStr.toLowerCase().includes("invalid api key") ||
      errStr.toLowerCase().includes("api_key_invalid")
    ) {
      userAdvice = `API Key for ${providerStr} appears to be invalid or unauthorized. Please verify your credentials.`;
    } else if (
      errStr.includes("404") ||
      errStr.toLowerCase().includes("not found") ||
      errStr.toLowerCase().includes("does not exist")
    ) {
      userAdvice = `Model '${modelStr}' was not found or is not supported by your API key/tier. Please check the model name.`;
    } else {
      userAdvice = `Provider error: ${message}`;
    }

    return NextResponse.json(
      {
        success: false,
        error: userAdvice,
        rawError: errStr,
      },
      { status: 500 }
    );
  }
}
