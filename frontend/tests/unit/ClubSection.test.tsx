import ClubSection from "../../src/components/ClubSection";
import { render, screen } from "@testing-library/react";
import React from "react";

interface Club {
  id: number;
  name: string;
  shortdescription: string;
  image: string;
  popularity: string;
}

describe("ClubSection Component", () => {
  it("renders club section with clubs", () => {
    const clubs: Club[] = [
      {
        id: 1,
        name: "Fencing Club",
        shortdescription: "Olympic Fencing @ QUB",
        image: "",
        popularity: "5",
      },
      {
        id: 2,
        name: "Computing Society",
        shortdescription: "Computing @ QUB",
        image: "",
        popularity: "6",
      },
      {
        id: 3,
        name: "Queen's Docs",
        shortdescription: "Doctors of Queens",
        image: "",
        popularity: "1",
      },
    ];
    render(<ClubSection clubs={clubs} />);

    expect(screen.getByText("Fencing Club")).toBeDefined();
    expect(screen.getByText("Olympic Fencing @ QUB")).toBeDefined();

    expect(screen.getByText("Computing Society")).toBeDefined();
    expect(screen.getByText("Computing @ QUB")).toBeDefined();

    expect(screen.getByText("Queen's Docs")).toBeDefined();
    expect(screen.getByText("Doctors of Queens")).toBeDefined();
  });
});
