import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AdminPanelPage } from "./AdminPanelPage";
import * as delibsModule from "@/modules/deliberations";
import * as adminRepo from "../api/admin-users.repository";

vi.mock("@/modules/deliberations", async () => {
  const actual = await vi.importActual<typeof import("@/modules/deliberations")>(
    "@/modules/deliberations"
  );
  return {
    ...actual,
    clearAllDeliberationsData: vi.fn(),
  };
});

vi.mock("../api/admin-users.repository", () => ({
  listAllUsers: vi.fn().mockResolvedValue([]),
  listAllAlumni: vi.fn().mockResolvedValue([]),
}));

describe("AdminPanelPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderPage() {
    const rendered = render(
      <BrowserRouter>
        <AdminPanelPage />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText("Loading members…")).not.toBeInTheDocument();
    });
    return rendered;
  }

  it("renders Deliberations section with Start delibs and Delete all entries & votes button", async () => {
    await renderPage();

    expect(screen.getByRole("heading", { name: "Deliberations" })).toBeInTheDocument();
    expect(
      screen.getByText("Open the deliberations board to select the active candidate and run voting.")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start delibs/i })).toHaveAttribute("href", "/delibs");
    expect(
      screen.getByRole("button", { name: /delete all entries & votes/i })
    ).toBeInTheDocument();
  });

  it("opens confirmation modal and does not delete if user cancels", async () => {
    const user = userEvent.setup();

    await renderPage();

    const deleteBtn = screen.getByRole("button", { name: /delete all entries & votes/i });
    await user.click(deleteBtn);

    // Modal is open
    expect(screen.getByRole("dialog", { name: /confirm deletion/i })).toBeInTheDocument();
    expect(screen.getByText("Delete all deliberations & votes?")).toBeInTheDocument();

    const cancelBtn = screen.getByRole("button", { name: /^cancel$/i });
    await user.click(cancelBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(delibsModule.clearAllDeliberationsData).not.toHaveBeenCalled();
  });

  it("calls clearAllDeliberationsData and shows success message when confirmed in modal", async () => {
    const user = userEvent.setup();
    vi.mocked(delibsModule.clearAllDeliberationsData).mockResolvedValue({
      deletedCandidatesCount: 5,
      clearedUsersCount: 12,
    });

    await renderPage();

    const deleteBtn = screen.getByRole("button", { name: /delete all entries & votes/i });
    await user.click(deleteBtn);

    const confirmBtn = screen.getByRole("button", { name: /yes, delete everything/i });
    await user.click(confirmBtn);

    expect(delibsModule.clearAllDeliberationsData).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(
        screen.getByText("Successfully deleted 5 deliberation candidates and cleared votes for 12 members.")
      ).toBeInTheDocument();
    });
  });

  it("displays error message if clearAllDeliberationsData fails", async () => {
    const user = userEvent.setup();
    vi.mocked(delibsModule.clearAllDeliberationsData).mockRejectedValue(
      new Error("Permission denied")
    );

    await renderPage();

    const deleteBtn = screen.getByRole("button", { name: /delete all entries & votes/i });
    await user.click(deleteBtn);

    const confirmBtn = screen.getByRole("button", { name: /yes, delete everything/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText("Permission denied")).toBeInTheDocument();
    });
  });
});

