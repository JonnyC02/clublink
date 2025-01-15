import { render, screen } from "@testing-library/react";
import ForgotPassword from "../../src/pages/ForgotPassword";
import React from "react";

describe("Forgot Password Integration Test", () => {
  it("Renders Page Correctly", () => {
    render(<ForgotPassword />);

    expect(screen.findByText("Forgot Password")).toBeDefined();
  });
});
