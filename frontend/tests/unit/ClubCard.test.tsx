import React from "react";
import { render, screen } from "@testing-library/react";
import ClubCard from "../../src/components/ClubCard";

describe("ClubCard Component", () => {
  it("renders the club name and description", () => {
    render(
      <ClubCard
        name="Chess Club"
        shortdescription="For chess lovers"
        image=""
        popularity={"4"}
      />
    );

    expect(screen.getByText("Chess Club")).toBeDefined();
    expect(screen.getByText("For chess lovers")).toBeDefined();
  });
});
