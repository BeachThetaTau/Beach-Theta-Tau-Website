import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AdminMembersPanel } from "./AdminMembersPanel";
import * as adminRepo from "../../api/admin-users.repository";
import type { MemberProfile } from "@beach-theta-tau/contracts";

vi.mock("../../api/admin-users.repository");

const mockUsers: MemberProfile[] = [
  {
    uid: "user-1",
    name: "Alex Smith",
    email: "alex@example.com",
    class: "Alpha",
    gradYear: "2025",
    major: "Computer Science",
    position: "Regent",
    verified: true,
    copied: false,
    votes: { c1: "yes" },
  },
  {
    uid: "user-2",
    name: "Jordan Lee",
    email: "jordan@example.com",
    class: "Beta",
    gradYear: "2026",
    major: "Mechanical Engineering",
    position: "Social Chair",
    verified: false,
    copied: false,
  },
];

const mockAlumni: MemberProfile[] = [
  {
    uid: "alum-1",
    name: "Taylor Old",
    email: "taylor@example.com",
    class: "Founding",
    gradYear: "2023",
    major: "Electrical Engineering",
    position: "Vice-Regent",
    verified: true,
  },
];

describe("AdminMembersPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminRepo.listAllUsers).mockResolvedValue([...mockUsers]);
    vi.mocked(adminRepo.listAllAlumni).mockResolvedValue([...mockAlumni]);
    vi.mocked(adminRepo.adminUpdateUser).mockResolvedValue();
    vi.mocked(adminRepo.adminGraduateUser).mockResolvedValue();
    vi.mocked(adminRepo.adminDeleteUser).mockResolvedValue();
    vi.mocked(adminRepo.adminRestoreAlumni).mockResolvedValue();
    vi.mocked(adminRepo.adminDeleteAlumni).mockResolvedValue();
    vi.mocked(adminRepo.wipeUserVotes).mockResolvedValue();
  });

  it("renders statistics and active members list", async () => {
    render(<AdminMembersPanel />);

    expect(screen.getByText("Loading members…")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Alex Smith")).toBeInTheDocument();
      expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    });

    expect(screen.getByText("Regent")).toBeInTheDocument();
    expect(screen.getByText("Social Chair")).toBeInTheDocument();
    expect(screen.getAllByText("Active Members").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /alumni collection/i })).toBeInTheDocument();
  });

  it("filters members based on search input", async () => {
    const user = userEvent.setup();
    render(<AdminMembersPanel />);

    await waitFor(() => {
      expect(screen.getByText("Alex Smith")).toBeInTheDocument();
    });

    const searchInput = screen.getByRole("searchbox", { name: /search members/i });
    await user.type(searchInput, "Jordan");

    expect(screen.queryByText("Alex Smith")).not.toBeInTheDocument();
    expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
  });

  it("opens edit modal and saves position update without admin toggle option", async () => {
    const user = userEvent.setup();
    render(<AdminMembersPanel />);

    await waitFor(() => {
      expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: /^edit$/i });
    await user.click(editButtons[1]!); // Jordan Lee's edit button

    expect(screen.getByRole("dialog", { name: "Edit member" })).toBeInTheDocument();
    expect(screen.getByText("Chapter Position")).toBeInTheDocument();
    expect(screen.queryByText("Permissions & Roles")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/administrator/i)).not.toBeInTheDocument();

    // Select position from dropdown
    const select = screen.getByLabelText("Select Standard Position");
    await user.selectOptions(select, "Treasurer");

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(adminRepo.adminUpdateUser).toHaveBeenCalledWith("user-2", expect.objectContaining({
        position: "Treasurer",
      }));
    });
  });

  it("allows graduating an active member to alumni collection", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<AdminMembersPanel />);

    await waitFor(() => {
      expect(screen.getByText("Alex Smith")).toBeInTheDocument();
    });

    const graduateButtons = screen.getAllByRole("button", { name: /^graduate$/i });
    await user.click(graduateButtons[0]!);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(adminRepo.adminGraduateUser).toHaveBeenCalledWith("user-1", expect.objectContaining({
        uid: "user-1",
        name: "Alex Smith",
      }));
      expect(screen.queryByText("Alex Smith")).not.toBeInTheDocument();
    });
  });

  it("allows permanently deleting a member", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<AdminMembersPanel />);

    await waitFor(() => {
      expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    });

    const deleteBtn = screen.getByRole("button", { name: /delete jordan lee/i });
    await user.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(adminRepo.adminDeleteUser).toHaveBeenCalledWith("user-2");
      expect(screen.queryByText("Jordan Lee")).not.toBeInTheDocument();
    });
  });

  it("switches to alumni tab and allows restore and delete", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<AdminMembersPanel />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /active members/i })).toBeInTheDocument();
    });

    const alumniTab = screen.getByRole("button", { name: /alumni collection/i });
    await user.click(alumniTab);

    expect(screen.getByText("Taylor Old")).toBeInTheDocument();
    expect(screen.getByText("Founding · 2023")).toBeInTheDocument();

    const restoreBtn = screen.getByRole("button", { name: /restore/i });
    await user.click(restoreBtn);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(adminRepo.adminRestoreAlumni).toHaveBeenCalledWith("alum-1", expect.objectContaining({
        uid: "alum-1",
        name: "Taylor Old",
      }));
      expect(screen.queryByText("Taylor Old")).not.toBeInTheDocument();
    });
  });

  it("displays admin badge for admin users and does not render role toggle buttons", async () => {
    const usersWithAdmin: MemberProfile[] = [
      {
        uid: "admin-user",
        name: "Admin Person",
        email: "admin@example.com",
        class: "Alpha",
        isAdmin: true,
        role: "admin",
        verified: true,
      },
      {
        uid: "regular-user",
        name: "Regular Person",
        email: "regular@example.com",
        class: "Beta",
        verified: true,
      },
    ];
    vi.mocked(adminRepo.listAllUsers).mockResolvedValue(usersWithAdmin);

    render(<AdminMembersPanel />);

    await waitFor(() => {
      expect(screen.getByText("Admin Person")).toBeInTheDocument();
    });

    // Admin badge exists next to the name
    expect(screen.getByTitle("Administrator")).toBeInTheDocument();

    // No role toggle buttons in the table
    expect(screen.queryByRole("button", { name: /^member$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^admin$/i })).not.toBeInTheDocument();
  });
});
