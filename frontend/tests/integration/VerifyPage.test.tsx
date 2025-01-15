import React from "react";
import VerifyPage from "../../src/pages/VerifyPage";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

describe("Verify Email Integration Test", () => {
  it("Renders the page correctly", () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/verify" element={<VerifyPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.findByText("Verifying...")).toBeDefined();
  });
});
