import React from "react";
import VerifyPage from "../../src/pages/VerifyPage";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useSearchParams, useNavigate } from "react-router-dom";

// Mock the react-router-dom hooks
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useSearchParams: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();

describe("Verify Email Integration Test", () => {
  const mockNavigate = jest.fn();
  const mockSearchParamsGet = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useSearchParams as jest.Mock).mockReturnValue([
      { get: mockSearchParamsGet }
    ]);
  });

  it("Renders the page with initial 'Verifying...' status", () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<VerifyPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.findByText("Verifying...")).toBeDefined();
  });

  it("Shows error message when token is missing", async () => {
    mockSearchParamsGet.mockReturnValue(null);

    render(
      <MemoryRouter>
        <VerifyPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Invalid verification link.")).toBeDefined();
    });
  });

  it("Shows success message and navigates to login when verification succeeds", async () => {
    mockSearchParamsGet.mockReturnValue("valid-token");
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true
    });

    render(
      <MemoryRouter>
        <VerifyPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Email verified successfully!")).toBeDefined();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("Shows failure message when verification fails", async () => {
    mockSearchParamsGet.mockReturnValue("invalid-token");
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false
    });

    render(
      <MemoryRouter>
        <VerifyPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Verification failed. Please try again.")).toBeDefined();
    });
  });

  it("Shows error message when fetch throws an error", async () => {
    mockSearchParamsGet.mockReturnValue("token");
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <VerifyPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("An error occurred. Please try again later.")).toBeDefined();
    });
  });
});
