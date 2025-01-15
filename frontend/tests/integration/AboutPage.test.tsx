import { render, screen } from "@testing-library/react";
import AboutPage from "../../src/pages/AboutPage";
import * as authUtils from "../../src/utils/auth";
import React from "react";

describe("AboutPage Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all main sections of the AboutPage", () => {
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(false);

    render(<AboutPage />);

    expect(screen.getByTestId("navbar")).toBeDefined();

    expect(screen.getByText("About Us")).toBeDefined();

    expect(screen.getByText("Our Mission")).toBeDefined();
    expect(screen.getByText("What We Offer")).toBeDefined();
    expect(screen.getByText("Join Us")).toBeDefined();
  });

  it("displays 'Login' and 'Join a Club' CTA when user is not authenticated", () => {
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(false);

    render(<AboutPage />);

    expect(screen.getByText("Login")).toHaveAttribute("href", "/login");
    expect(screen.getByText("Join a Club")).toHaveAttribute("href", "/clubs");
  });

  it("renders a call-to-action to browse clubs", () => {
    render(<AboutPage />);

    const browseClubsButtons = screen.getAllByRole("link", {
      name: "Browse Clubs",
    });
    expect(browseClubsButtons).toBeDefined();
    browseClubsButtons.forEach((button) => {
      expect(button).toHaveAttribute("href", "/clubs");
    });
  });
});
