import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MessageInput } from "./MessageInput";

describe("MessageInput", () => {
  it("disables send when the message only contains whitespace", () => {
    render(
      <MessageInput
        inputValue="   "
        setInputValue={vi.fn()}
        isSending={false}
        handleSendMessage={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });

  it("updates the input and sends the current message", async () => {
    const user = userEvent.setup();
    const setInputValue = vi.fn();
    const handleSendMessage = vi.fn();

    const { rerender } = render(
      <MessageInput
        inputValue=""
        setInputValue={setInputValue}
        isSending={false}
        handleSendMessage={handleSendMessage}
      />
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello Syntia" } });

    expect(setInputValue).toHaveBeenLastCalledWith("Hello Syntia");

    rerender(
      <MessageInput
        inputValue="Hello Syntia"
        setInputValue={setInputValue}
        isSending={false}
        handleSendMessage={handleSendMessage}
      />
    );

    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(handleSendMessage).toHaveBeenCalledTimes(1);
  });
});
