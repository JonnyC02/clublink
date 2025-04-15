import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPassword from "../../src/pages/ResetPassword";
import React from "react";
import userEvent from "@testing-library/user-event";

// Mock fetch API
global.fetch = jest.fn();

// Mock URLSearchParams
const mockURLSearchParams = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    search: '?token=test-token'
  }
});

global.URLSearchParams = jest.fn().mockImplementation(() => ({
  get: mockURLSearchParams
}));

describe("Reset Password Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockURLSearchParams.mockReturnValue("test-token");
  });

  it("Renders the page correctly", () => {
    render(<ResetPassword />);

    expect(screen.getByText("Reset Your Password")).toBeDefined();
    expect(screen.getByLabelText("New Password")).toBeDefined();
    expect(screen.getByLabelText("Confirm Password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Reset Password" })).toBeDefined();
  });

  it("Sets token from URL parameters", () => {
    render(<ResetPassword />);
    
    expect(mockURLSearchParams).toHaveBeenCalledWith("token");
  });

  it("Shows error when passwords don't match", async () => {
    render(<ResetPassword />);
    
    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    
    await userEvent.type(newPasswordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password456");
    fireEvent.click(submitButton);
    
    expect(await screen.findByText("Passwords do not match")).toBeDefined();
  });

  it("Submits form with matching passwords", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true
    });
    
    render(<ResetPassword />);
    
    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    
    await userEvent.type(newPasswordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/auth/reset-password`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: "test-token",
            newPassword: "password123",
          }),
        })
      );
    });
    
    expect(await screen.findByText("Your password has been successfully reset. You can now log in.")).toBeDefined();
  });

  it("Shows error message when API returns an error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Invalid token" })
    });
    
    render(<ResetPassword />);
    
    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    
    await userEvent.type(newPasswordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");
    fireEvent.click(submitButton);
    
    expect(await screen.findByText("Invalid token")).toBeDefined();
  });

  it("Shows generic error message when API returns no specific message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({})
    });
    
    render(<ResetPassword />);
    
    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    
    await userEvent.type(newPasswordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");
    fireEvent.click(submitButton);
    
    expect(await screen.findByText("Failed to reset password. Please try again.")).toBeDefined();
  });

  it("Shows error message when fetch throws an error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    
    render(<ResetPassword />);
    
    const newPasswordInput = screen.getByLabelText("New Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: "Reset Password" });
    
    await userEvent.type(newPasswordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");
    fireEvent.click(submitButton);
    
    expect(await screen.findByText("An unexpected error occurred. Please try again later.")).toBeDefined();
  });
});
