import { render, screen, waitFor } from "@testing-library/react";
import ClubsPage from "../../src/pages/ClubsPage";
import React from "react";

jest.mock("../../src/components/Navbar", () => () => {
  <div data-testid="navbar">Navbar</div>;
});

jest.mock("../../src/components/TitleSection", () => () => {
  <div data-testid="titlesection">Title Section</div>;
});

describe("ClubsPage Integration Test", () => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn(),
  };

  beforeAll(() => {
    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
    });
    global.fetch = jest.fn();
  });

  beforeEach(() => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) =>
      success({ coords: { latitude: 0, longitude: 0 } })
    );
    jest.clearAllMocks();
  });

  it("renders components together", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 1,
          name: "Queen's Fencing Club",
          shortdescription: "Olympic Fencing @ QUB",
          image:
            "https://club-images-dev.s3.us-east-1.amazonaws.com/fencingimage.webp",
          university: "QUB",
          clubtype: "Club",
          distance: null,
          popularity: "3",
          universitypriority: 0,
        },
        {
          id: 2,
          name: "Queen's Computing Society",
          shortdescription: "Test Value",
          image: "https://club-images-dev.s3.us-east-1.amazonaws.com/qcs.jpg",
          university: "",
          clubtype: "Society",
          distance: null,
          popularity: "0",
          universitypriority: 0,
        },
        {
          id: 3,
          name: "Queen's Docs",
          shortdescription: "Doctors of Queen's",
          image:
            "https://club-images-dev.s3.us-east-1.amazonaws.com/doctor.jpg",
          university: "QUB",
          clubtype: "Society",
          distance: null,
          popularity: "0",
          universitypriority: 0,
        },
      ],
    });
    render(<ClubsPage />);
    await waitFor(() => {
      expect(screen.getByText("Doctors of Queen's")).toBeDefined();
    });
  });
});
