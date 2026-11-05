import { render, screen, waitFor } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MemberProfile } from "@beach-theta-tau/contracts";
import { BrothersPage } from "./BrothersPage";
import * as repo from "../api/members.repository";

vi.mock("../api/members.repository");
vi.mock("@/shared/ui/PageHero/PageHero", () => ({ default: () => <div data-testid="hero" /> }));

const members: MemberProfile[] = [
  { uid: "1", name: "Alex Smith", class: "Alpha", major: "Computer Science", verified: true },
];

function renderPage() {
  return render(
    <Provider store={createStore()}>
      <BrothersPage />
    </Provider>,
  );
}

describe("BrothersPage loading", () => {
  beforeEach(() => {
    vi.mocked(repo.peekCachedMembers).mockReturnValue(null);
  });

  it("shows grid skeletons first, then the members", async () => {
    vi.mocked(repo.getVerifiedMembers).mockResolvedValue(members);
    renderPage();
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(await screen.findByText("Alex Smith")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("paints cached members immediately with no skeleton", () => {
    vi.mocked(repo.peekCachedMembers).mockReturnValue({ members, fresh: false });
    vi.mocked(repo.getVerifiedMembers).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText("Alex Smith")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps showing cached members if the background refresh fails", async () => {
    vi.mocked(repo.peekCachedMembers).mockReturnValue({ members, fresh: false });
    vi.mocked(repo.getVerifiedMembers).mockRejectedValue(new Error("offline"));
    renderPage();
    await waitFor(() => expect(repo.getVerifiedMembers).toHaveBeenCalled());
    expect(await screen.findByText("Alex Smith")).toBeInTheDocument();
    expect(screen.queryByText("Member directory unavailable")).not.toBeInTheDocument();
  });

  it("shows the error state when there is nothing cached", async () => {
    vi.mocked(repo.getVerifiedMembers).mockRejectedValue(new Error("offline"));
    renderPage();
    expect(await screen.findByText("Member directory unavailable")).toBeInTheDocument();
  });

  it("loads the small thumbnail, not the full photo, in the grid", async () => {
    vi.mocked(repo.getVerifiedMembers).mockResolvedValue(members);
    renderPage();
    const image = await screen.findByAltText("Alex Smith's profile");
    expect(image.getAttribute("src")).toMatch(/\.webp$/);
    expect(image).toHaveAttribute("loading");
    expect(image).toHaveAttribute("width", "400");
  });
});
