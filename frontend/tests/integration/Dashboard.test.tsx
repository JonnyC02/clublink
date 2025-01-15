import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "../../src/pages/Dashboard";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("../../src/components/Navbar", () => () => {
  <div data-testid="navbar">Navbar</div>;
});

describe("Dashboard Integration Test", () => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn(),
  };

  beforeAll(() => {
    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
    });
    global.fetch = jest.fn();
  });

  beforeEach(() => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
      success({ coords: { latitude: 0, longitude: 0 } })
    );
    jest.clearAllMocks();
  });

  it("renders components together", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 1,
          name: "Queen's Fencing Club",
          shortdescription: "Olympic Fencing @ QUB",
          image:
            "https://club-images-dev.s3.us-east-1.amazonaws.com/fencingimage.webp",
          iscommittee: true,
        },
      ],
    });
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.findByText("Queen's Fencing Club")).toBeDefined();
    });
  });

  it("renders no clubs", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.findByText("No Clubs")).toBeDefined();
    });
  });
});
