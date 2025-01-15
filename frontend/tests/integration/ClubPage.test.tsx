import { render, screen, waitFor } from "@testing-library/react";
import ClubPage from "../../src/pages/ClubPage";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("../../src/components/Navbar", () => () => {
  <div data-testid="navbar">Navbar</div>;
});

jest.mock("../../src/components/TitleSection", () => () => {
  <div data-testid="titlesection">Title Section</div>;
});

describe("Club Page Integration Test", () => {
  beforeAll(() => {
    global.fetch = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders components together", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    const clubId = 1;
    render(
      <MemoryRouter initialEntries={[`/club/${clubId}`]}>
        <Routes>
          <Route path="/club/:id" element={<ClubPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.findByText("Committee Members")).toBeDefined();
      expect(screen.findByText("Member Count:")).toBeDefined();
      expect(screen.findByText("Want to Join?")).toBeDefined();
    });
  });
});
