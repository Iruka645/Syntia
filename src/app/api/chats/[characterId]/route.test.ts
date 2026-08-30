import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSessionMock, findFirstMock, deleteManyMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  findFirstMock: vi.fn(),
  deleteManyMock: vi.fn(),
}));

vi.mock("next-auth/next", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    chat: {
      findFirst: findFirstMock,
    },
    message: {
      deleteMany: deleteManyMock,
    },
  },
}));

import { DELETE } from "./route";

describe("DELETE /api/chats/[characterId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSessionMock.mockResolvedValue({ user: { id: "7" } });
  });

  it("rejects unauthenticated requests", async () => {
    getServerSessionMock.mockResolvedValue(null);

    const response = await DELETE(new Request("http://localhost/api/chats/3"), {
      params: Promise.resolve({ characterId: "3" }),
    });

    expect(response.status).toBe(401);
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it("deletes only messages from the current user's character chat", async () => {
    findFirstMock.mockResolvedValue({ id: 42 });
    deleteManyMock.mockResolvedValue({ count: 6 });

    const response = await DELETE(new Request("http://localhost/api/chats/3"), {
      params: Promise.resolve({ characterId: "3" }),
    });

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { userId: 7, characterId: 3 },
      select: { id: true },
    });
    expect(deleteManyMock).toHaveBeenCalledWith({ where: { chatId: 42 } });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: "Chat history reset successfully",
      deletedCount: 6,
    });
  });

  it("does not delete anything when the user's chat is missing", async () => {
    findFirstMock.mockResolvedValue(null);

    const response = await DELETE(new Request("http://localhost/api/chats/999"), {
      params: Promise.resolve({ characterId: "999" }),
    });

    expect(response.status).toBe(404);
    expect(deleteManyMock).not.toHaveBeenCalled();
  });
});
