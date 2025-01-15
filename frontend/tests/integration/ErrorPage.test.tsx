import { render, screen } from "@testing-library/react";
import ErrorPage from "../../src/pages/ErrorPage";
import React from "react";

describe("Error Page Integration Tests", () => {
  it("Renders Page Correctly", () => {
    render(<ErrorPage />);

    expect(screen.findByText("Something Went Wrong!")).toBeDefined();
  });
});
