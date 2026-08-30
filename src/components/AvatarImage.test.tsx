import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AvatarImage } from "./AvatarImage";

describe("AvatarImage", () => {
  it("shows its fallback after the avatar fails to load", () => {
    render(
      <div className="relative">
        <AvatarImage src="/missing-avatar.jpg" alt="Test avatar" sizes="40px">
          <span>Avatar fallback</span>
        </AvatarImage>
      </div>
    );

    fireEvent.error(screen.getByAltText("Test avatar"));

    expect(screen.queryByAltText("Test avatar")).toBeNull();
    expect(screen.getByText("Avatar fallback").textContent).toBe("Avatar fallback");
  });
});
