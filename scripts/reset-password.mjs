import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const HELP = `
Soft-reset a Syntia user's password without deleting account data.

Usage:
  npm run reset-password -- <username>

Example:
  npm run reset-password -- Kensakato
`;

function readHidden(prompt) {
  if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== "function") {
    throw new Error("Password reset must be run in an interactive terminal.");
  }

  return new Promise((resolve, reject) => {
    let value = "";
    const previousRawMode = input.isRaw;

    const cleanup = () => {
      input.off("data", onData);
      input.setRawMode(previousRawMode);
      input.pause();
    };

    const onData = (chunk) => {
      for (const character of String(chunk)) {
        if (character === "\u0003") {
          cleanup();
          output.write("\n");
          reject(new Error("Password reset cancelled."));
          return;
        }

        if (character === "\r" || character === "\n") {
          cleanup();
          output.write("\n");
          resolve(value);
          return;
        }

        if (character === "\u007f" || character === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            output.write("\b \b");
          }
          continue;
        }

        if (character >= " ") {
          value += character;
          output.write("*");
        }
      }
    };

    output.write(prompt);
    input.setEncoding("utf8");
    input.setRawMode(true);
    input.resume();
    input.on("data", onData);
  });
}

function validatePassword(password) {
  if (password.length < 8) {
    return "Password must contain at least 8 characters.";
  }

  if (password.length > 128) {
    return "Password must not exceed 128 characters.";
  }

  return null;
}

function normalizeAccountIdentifier(value) {
  return value.trim().toLocaleLowerCase();
}

function resolveUser(users, identifier) {
  const exactUsernameMatch = users.find((user) => user.username === identifier);
  if (exactUsernameMatch) return exactUsernameMatch;

  const normalizedIdentifier = normalizeAccountIdentifier(identifier);
  const usernameMatches = users.filter(
    (user) => normalizeAccountIdentifier(user.username) === normalizedIdentifier
  );

  if (usernameMatches.length === 1) return usernameMatches[0];
  if (usernameMatches.length > 1) {
    throw new Error(`More than one username matches '${identifier}' after normalization.`);
  }

  const displayNameMatches = users.filter(
    (user) => normalizeAccountIdentifier(user.name) === normalizedIdentifier
  );

  if (displayNameMatches.length === 1) return displayNameMatches[0];
  if (displayNameMatches.length > 1) {
    throw new Error(
      `More than one display name matches '${identifier}'. Run the command with an exact username.`
    );
  }

  return null;
}

async function main() {
  const argument = process.argv[2]?.trim();

  if (argument === "--help" || argument === "-h") {
    output.write(HELP);
    return;
  }

  const terminal = createInterface({ input, output });
  const username = argument || (await terminal.question("Username to reset: ")).trim();

  if (!username) {
    terminal.close();
    throw new Error("Username is required.");
  }

  const url = process.env.DATABASE_URL || "file:./dev.db";
  const adapter = new PrismaBetterSqlite3({ url });
  const prisma = new PrismaClient({ adapter });

  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, name: true },
    });
    const user = resolveUser(users, username);

    if (!user) {
      throw new Error(`User '${username}' was not found.`);
    }

    const confirmation = (
      await terminal.question(
        `Reset password for username ${JSON.stringify(user.username)} (${user.name.trim()})? [y/N] `
      )
    )
      .trim()
      .toLowerCase();

    if (confirmation !== "y" && confirmation !== "yes") {
      terminal.close();
      output.write("Password reset cancelled.\n");
      return;
    }

    const trimmedUsername = user.username.trim();
    let normalizeUsername = false;

    if (trimmedUsername !== user.username) {
      const conflictingUsername = users.some(
        (candidate) => candidate.id !== user.id && candidate.username === trimmedUsername
      );

      if (conflictingUsername) {
        output.write(
          `Username contains surrounding whitespace but '${trimmedUsername}' is already in use; it will not be changed.\n`
        );
      } else {
        const normalizationConfirmation = (
          await terminal.question(
            `Stored username contains surrounding whitespace. Normalize it to '${trimmedUsername}'? [Y/n] `
          )
        )
          .trim()
          .toLowerCase();
        normalizeUsername =
          normalizationConfirmation === "" ||
          normalizationConfirmation === "y" ||
          normalizationConfirmation === "yes";
      }
    }

    terminal.close();

    const newPassword = await readHidden("New password: ");
    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      throw new Error(passwordError);
    }

    const confirmationPassword = await readHidden("Confirm new password: ");

    if (newPassword !== confirmationPassword) {
      throw new Error("Passwords do not match.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        username: normalizeUsername ? trimmedUsername : undefined,
      },
    });

    const loginUsername = normalizeUsername ? trimmedUsername : user.username;
    output.write(
      `Password reset successfully. Login username: ${JSON.stringify(loginUsername)}.\n`
    );
    output.write("Existing characters, chats, messages, archives, and settings were preserved.\n");
  } finally {
    terminal.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Password reset failed: ${message}`);
  process.exitCode = 1;
});
