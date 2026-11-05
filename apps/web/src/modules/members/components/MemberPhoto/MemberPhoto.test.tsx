import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemberPhoto } from "./MemberPhoto";
import { memberPhotoSources } from "../../utils/member-photos";

vi.mock("../../utils/member-photos", () => ({ memberPhotoSources: vi.fn() }));
const member = { name: "Alex Smith", verified: true };

describe("MemberPhoto failures", () => {
  beforeEach(() => {
    vi.mocked(memberPhotoSources).mockReturnValue(["/thumb.webp", "/full.webp", "/blank.webp"]);
  });

  it("tries each fallback once, then displays initials if even the placeholder fails", () => {
    render(<MemberPhoto member={member} />);
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", "/thumb.webp");
    fireEvent.error(image);
    expect(image).toHaveAttribute("src", "/full.webp");
    fireEvent.error(image);
    expect(image).toHaveAttribute("src", "/blank.webp");
    fireEvent.error(image);
    expect(screen.getByRole("img")).not.toHaveAttribute("src");
    expect(screen.getByRole("img")).toHaveTextContent("AS");
  });

  it("shows initials without requesting an empty URL when no assets exist", () => {
    vi.mocked(memberPhotoSources).mockReturnValue([]);
    render(<MemberPhoto member={member} />);
    expect(screen.getByRole("img")).toHaveTextContent("AS");
    expect(screen.getByRole("img")).not.toHaveAttribute("src");
  });
});
