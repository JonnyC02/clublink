import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Navbar from "../../src/components/Navbar";

describe("Navbar Component", () => {
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

  it("renders Navbar correctly", () => {
    render(<Navbar cta={cta} links={links} />);
    expect(screen.getByText("ClubLink")).toBeDefined();
    links.forEach((link) => expect(screen.getByText(link.label)).toBeDefined());
    expect(screen.getByText("Get Started")).toBeDefined();
    expect(screen.getByText("Join a Club")).toBeDefined();
  });

  it("renders custom brand name", () => {
    render(<Navbar cta={cta} links={links} brandName="MyBrand" />);
    expect(screen.getByText("MyBrand")).toBeDefined();
  });

  it("toggles mobile menu", () => {
    render(<Navbar cta={cta} links={links} />);
    const button = screen.getByRole("button", { name: /toggle menu/i });
    fireEvent.click(button);

    links.forEach((link) =>
      expect(screen.getAllByText(link.label)[0]).toBeDefined()
    );
    expect(screen.getAllByText("Get Started").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Join a Club").length).toBeGreaterThan(0);
  });

  it("closes mobile menu when link clicked", () => {
    render(<Navbar cta={cta} links={links} />);
    const button = screen.getByRole("button", { name: /toggle menu/i });
    fireEvent.click(button);
    const link = screen.getAllByText("Home")[0];
    fireEvent.click(link);
    expect(link).toBeDefined();
  });
});
