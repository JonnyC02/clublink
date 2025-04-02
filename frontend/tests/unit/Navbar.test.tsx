import React from "react";
import { render, screen } from "@testing-library/react";
import Navbar from "../../src/components/Navbar";

describe("Navbar Correctly", () => {
  const links = [
    { label: "Home", href: "#" },
    { label: "Browse Clubs", href: "#" },
    { label: "FAQ", href: "/faq" },
    { label: "About", href: "#" },
  ];

  const cta = (
    <>
      <a
        href="#"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Get Started
      </a>
      <a
        href="#"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Join a Club
      </a>
    </>
  );
  it("Render Navbar Correctly", () => {
    render(<Navbar cta={cta} links={links} />);

    expect(screen.getByText("ClubLink")).toBeDefined();
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Browse Clubs")).toBeDefined();
    expect(screen.getByText("Browse Clubs")).toBeDefined();
    expect(screen.getByText("About")).toBeDefined();

    expect(screen.getByText("Get Started")).toBeDefined();
    expect(screen.getByText("Join a Club")).toBeDefined();
  });

  it("Should Change brand name", () => {
    render(<Navbar cta={cta} links={links} brandName="Test Value" />);

    expect(screen.getByText("Test Value")).toBeDefined();
  });
});
