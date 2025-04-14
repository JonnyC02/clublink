import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Footer from "../../src/components/Footer";

global.fetch = jest.fn();

describe("Footer Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders footer static content correctly", () => {
    render(<Footer />);

    expect(screen.getByText("ClubLink")).toBeDefined();
    expect(
      screen.getByText("Discover and manage your clubs in one place")
    ).toBeDefined();
    expect(screen.getByText("Stay Updated")).toBeDefined();
    expect(screen.getByText("Subscribe")).toBeDefined();
    expect(
      screen.getByText("© 2025 ClubLink. All rights reserved")
    ).toBeDefined();
  });

  it("shows success message on successful subscription", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(<Footer />);
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByText("Subscribe"));

    await waitFor(() =>
      expect(screen.getByText("🎉 Thanks for subscribing!")).toBeDefined()
    );
  });

  it("shows exists message when already subscribed", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 403 });

    render(<Footer />);
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "exists@example.com" },
    });
    fireEvent.click(screen.getByText("Subscribe"));

    await waitFor(() =>
      expect(screen.getByText("🎉 You've already subscribed!")).toBeDefined()
    );
  });

  it("shows error message on unknown server error", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

    render(<Footer />);
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "fail@example.com" },
    });
    fireEvent.click(screen.getByText("Subscribe"));

    await waitFor(() =>
      expect(
        screen.getByText("⚠️ Something went wrong on our end. Try again.")
      ).toBeDefined()
    );
  });

  it("does not submit if email is empty", async () => {
    render(<Footer />);
    fireEvent.click(screen.getByText("Subscribe"));

    expect(fetch).not.toHaveBeenCalled();
  });
});
