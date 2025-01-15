/* eslint-disable react/display-name */
import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import HomePage from "../../src/pages/HomePage";

jest.mock("../../src/components/Navbar", () => () => (
  <div data-testid="navbar">Navbar Mock</div>
));
jest.mock("../../src/components/Hero", () => () => (
  <div data-testid="hero">Hero Mock</div>
));
jest.mock("../../src/components/FeatureSection", () => () => (
  <div data-testid="features-section">FeaturesSection Mock</div>
));
jest.mock("../../src/components/Footer", () => () => (
  <div data-testid="footer">Footer Mock</div>
));

jest.mock("../../src/components/ClubSection", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ clubs }: { clubs: any[] }) => (
    <div data-testid="clubs-section">
      {clubs.length > 0 ? "Clubs Loaded" : "No Clubs"}
    </div>
  ),
}));

describe("HomePage Integration Tests", () => {
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
    jest.clearAllMocks();

    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
      success({ coords: { latitude: 0, longitude: 0 } })
    );

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it("renders all main components together", () => {
    render(<HomePage />);

    expect(screen.getByTestId("navbar")).toBeDefined();
    expect(screen.getByTestId("hero")).toBeDefined();
    expect(screen.getByTestId("features-section")).toBeDefined();
    expect(screen.getByTestId("clubs-section")).toBeDefined();
    expect(screen.getByTestId("footer")).toBeDefined();
  });

  it('renders "No Clubs" when no clubs are fetched', async () => {
    render(<HomePage />);

    await waitFor(() =>
      expect(screen.getByTestId("clubs-section")).toHaveTextContent("No Clubs")
    );
  });

  it("renders clubs when clubs are provided", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: "Club 1" },
        { id: 2, name: "Club 2" },
      ],
    });

    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() =>
      expect(screen.getByTestId("clubs-section")).toHaveTextContent(
        "Clubs Loaded"
      )
    );
  });
});
