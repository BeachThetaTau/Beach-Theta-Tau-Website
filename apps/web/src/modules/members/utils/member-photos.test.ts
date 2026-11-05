import { describe, expect, it, vi } from "vitest";
import { findAssetUrl } from "@/shared/lib/assets";
import { memberPhotoSources, prefetchMemberPhoto } from "./member-photos";

describe("member photo resolution", () => {
  it("uses generated thumbnails before the full photo", () => {
    const member = { name: "Zehra Tezel", verified: true };
    const thumb = findAssetUrl("members/BrothersThumbs/zehratezel.webp");
    const full = findAssetUrl("members/Brothers/zehratezel.webp");
    expect(thumb).toBeTruthy();
    expect(full).toBeTruthy();
    expect(memberPhotoSources(member, "thumbnail")[0]).toBe(thumb);
    expect(memberPhotoSources(member, "full")[0]).toBe(full);
  });

  it("returns no image sources for missing or unverified portraits", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(memberPhotoSources({ name: "Missing Person", verified: true }, "thumbnail")).toEqual(
        [],
      );
      expect(memberPhotoSources({ name: "Zehra Tezel", verified: false }, "full")).toEqual([]);
      prefetchMemberPhoto({ name: "Missing Person", verified: true });
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
