/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPassword from "../../src/pages/ForgotPassword";
import React from "react";
import userEvent from "@testing-library/user-event";

global.fetch = jest.fn();

describe("Forgot Password Integration Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Renders Page Correctly", () => {
    render(<ForgotPassword />);

    expect(screen.getByText("Forgot Password")).toBeDefined();
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByRole("button", { name: "Send Password Reset Link" })).toBeDefined();
  });

  it("Updates email input value when typed", async () => {
    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText("Email");
    await userEvent.type(emailInput, "test@example.com");
    
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("Shows success message when API call succeeds", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true
    });
    
    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", { name: "Send Password Reset Link" });
    
    await userEvent.type(emailInput, "test@example.com");
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/auth/forgot-password`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: "test@example.com" }),
        })
      );
    });
    
    expect(await screen.findByText("Password reset email has been sent! Please check your inbox.")).toBeDefined();
  });

  it("Shows error message when API returns an error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Email not found" })
    });
    
    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", { name: "Send Password Reset Link" });
    
    await userEvent.type(emailInput, "nonexistent@example.com");
    fireEvent.click(submitButton);
    
    expect(await screen.findByText("Email not found")).toBeDefined();
  });

  it("Shows generic error message when API returns no specific message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({})
    });
    
    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", { name: "Send Password Reset Link" });
    
    await userEvent.type(emailInput, "test@example.com");
    fireEvent.click(submitButton);
    
    expect(await screen.findByText("An error occurred. Please try again.")).toBeDefined();
  });

  it("Shows error message when fetch throws an error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    
    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", { name: "Send Password Reset Link" });
    
    await userEvent.type(emailInput, "test@example.com");
    fireEvent.click(submitButton);
    
    expect(await screen.findByText("An unexpected error occurred. Please try again later.")).toBeDefined();
  });

  it("Changes button text to 'Sending...' when loading", async () => {
    let resolvePromise: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);
    
    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", { name: "Send Password Reset Link" });
    
    await userEvent.type(emailInput, "test@example.com");
    fireEvent.click(submitButton);
    
    expect(await screen.findByText("Sending...")).toBeDefined();
    
    resolvePromise!({ ok: true });
  });

  it("Disables the button when form is submitting", async () => {
    let resolvePromise: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    (global.fetch as jest.Mock).mockReturnValueOnce(fetchPromise);
    
    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText("Email");
    const submitButton = screen.getByRole("button", { name: "Send Password Reset Link" });
    
    await userEvent.type(emailInput, "test@example.com");
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass("opacity-50");
    });
    
    resolvePromise!({ ok: true });
  });
});
