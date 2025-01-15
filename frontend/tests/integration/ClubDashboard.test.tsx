import ClubDashboard from "../../src/pages/ClubDashboard";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("../../src/components/Navbar", () => () => {
  <div data-testid="navbar">Navbar</div>;
});

jest.mock("../../src/components/TitleSection", () => () => {
  <div data-testid="titlesection">Title Section</div>;
});

describe("ClubDashboard Integration Tests", () => {
  beforeAll(() => {
    global.fetch = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders components together", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        Club: {},
        MemberList: [],
        Requests: [],
      }),
    });
    const clubId = 1;
    render(
      <MemoryRouter initialEntries={[`/club/${clubId}/committee`]}>
        <Routes>
          <Route path="/club/:id/committee" element={<ClubDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Requests")).toBeDefined();
      expect(screen.getByText("Member List")).toBeDefined();
      expect(screen.getByText("Club Details")).toBeDefined();
      expect(screen.getByText("Pending Requests")).toBeDefined();
      expect(screen.getByText("No pending requests.")).toBeDefined();
    });
    await waitFor(() => {
      screen.findByText("Member List").then(async (ele) => {
        await ele.click();
      });
      expect(screen.getByText("No members found.")).toBeDefined();
    });
  });

  it("renders error when club data fetch fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => [],
    });
    render(
      <MemoryRouter initialEntries={[`/club/undefined/committee`]}>
        <Routes>
          <Route path="/club/:id/committee" element={<ClubDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(
        screen.getByText("An error occurred while fetching club details.")
      ).toBeDefined()
    );
  });
});
