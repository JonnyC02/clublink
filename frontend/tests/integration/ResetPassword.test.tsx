import { render, screen } from "@testing-library/react";
import ResetPassword from "../../src/pages/ResetPassword";
import React from "react";

describe("Reset Password Integration Test", () => {
  it("Renders the page correctly", () => {
    render(<ResetPassword />);

    expect(screen.findByText("New Password")).toBeDefined();
    expect(screen.findByText("Confirm Password")).toBeDefined();
  });
});
