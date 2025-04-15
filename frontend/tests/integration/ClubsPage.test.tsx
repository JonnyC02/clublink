/* eslint-disable react/display-name */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ClubsPage from "../../src/pages/ClubsPage";
import React from "react";

jest.mock("../../src/components/Navbar", () => () => (
  <div data-testid="navbar">Navbar</div>
));

jest.mock("../../src/components/TitleSection", () => () => (
  <div data-testid="titlesection">Title Section</div>
));

jest.mock("../../src/components/Filters", () => ({ 
  filterOptions, 
  onFilterChange 
}: {
  filterOptions: Array<{
    id: string;
    label: string;
    type: string;
    placeholder?: string;
  }>;
  filters: Record<string, string>;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) => (
  <div data-testid="filters">
    {filterOptions.map((option) => (
      <div key={option.id}>
        <label htmlFor={option.id}>{option.label}</label>
        <input 
          id={option.id}
          name={option.id}
          type={option.type}
          placeholder={option.placeholder}
          onChange={onFilterChange}
          data-testid={`filter-${option.id}`}
        />
      </div>
    ))}
  </div>
));

jest.mock("../../src/utils/auth", () => ({
  isAuthenticated: jest.fn().mockReturnValue(false)
}));

describe("ClubsPage Integration Test", () => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn(),
  };

  const mockClubs = [
    {
      id: 1,
      name: "Queen's Fencing Club",
      shortdescription: "Olympic Fencing @ QUB",
      image: "https://club-images-dev.s3.us-east-1.amazonaws.com/fencingimage.webp",
      university: "QUB",
      clubtype: "Club",
      distance: null,
      popularity: 3,
      universitypriority: 0,
    },
    {
      id: 2,
      name: "Queen's Computing Society",
      shortdescription: "Test Value",
      image: "https://club-images-dev.s3.us-east-1.amazonaws.com/qcs.jpg",
      university: "UU",
      clubtype: "Society",
      distance: null,
      popularity: 15,
      universitypriority: 0,
    },
    {
      id: 3,
      name: "Queen's Docs",
      shortdescription: "Doctors of Queen's",
      image: "https://club-images-dev.s3.us-east-1.amazonaws.com/doctor.jpg",
      university: "QUB",
      clubtype: "Society",
      distance: null,
      popularity: 35,
      universitypriority: 0,
    },
  ];

  const mockUniversities = [
    { id: 1, name: "Queen's University Belfast", acronym: "QUB" },
    { id: 2, name: "Ulster University", acronym: "UU" }
  ];

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
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/clubs")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockClubs,
        });
      } else if (url.includes("/universities")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockUniversities,
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(<ClubsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Queen's Fencing Club")).toBeInTheDocument();
      expect(screen.getByText("Olympic Fencing @ QUB")).toBeInTheDocument();
      expect(screen.getByText("Queen's Computing Society")).toBeInTheDocument();
      expect(screen.getByText("Doctors of Queen's")).toBeInTheDocument();
    });
  });

  it("handles API error gracefully", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/clubs")) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ message: "Failed to fetch clubs" }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(<ClubsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Failed to fetch clubs.")).toBeInTheDocument();
    });
  });

  it("handles network error gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(<ClubsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("filters clubs by search term", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/clubs")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockClubs,
        });
      } else if (url.includes("/universities")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockUniversities,
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(<ClubsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Queen's Fencing Club")).toBeInTheDocument();
      expect(screen.getByText("Queen's Computing Society")).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId("filter-search");
    fireEvent.change(searchInput, { target: { value: "fencing" } });

    expect(screen.getByText("Queen's Fencing Club")).toBeInTheDocument();
    expect(screen.queryByText("Queen's Computing Society")).not.toBeInTheDocument();
    expect(screen.queryByText("Queen's Docs")).not.toBeInTheDocument();
  });

  it("filters clubs by university", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/clubs")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockClubs,
        });
      } else if (url.includes("/universities")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockUniversities,
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(<ClubsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Queen's Fencing Club")).toBeInTheDocument();
    });

    const universityFilter = screen.getByTestId("filter-university");
    fireEvent.change(universityFilter, { target: { value: "UU" } });

    expect(screen.queryByText("Queen's Fencing Club")).not.toBeInTheDocument();
    expect(screen.getByText("Queen's Computing Society")).toBeInTheDocument();
    expect(screen.queryByText("Queen's Docs")).not.toBeInTheDocument();
  });

  it("filters clubs by club type", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/clubs")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockClubs,
        });
      } else if (url.includes("/universities")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockUniversities,
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(<ClubsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Queen's Fencing Club")).toBeInTheDocument();
    });

    const clubTypeFilter = screen.getByTestId("filter-clubtype");
    fireEvent.change(clubTypeFilter, { target: { value: "Society" } });

    expect(screen.queryByText("Queen's Fencing Club")).not.toBeInTheDocument();
    expect(screen.getByText("Queen's Computing Society")).toBeInTheDocument();
    expect(screen.getByText("Queen's Docs")).toBeInTheDocument();
  });

  it("filters clubs by popularity", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/clubs")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockClubs,
        });
      } else if (url.includes("/universities")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockUniversities,
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(<ClubsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Queen's Fencing Club")).toBeInTheDocument();
    });

    const popularityFilter = screen.getByTestId("filter-popularity");
    fireEvent.change(popularityFilter, { target: { value: "large" } });

    expect(screen.queryByText("Queen's Fencing Club")).not.toBeInTheDocument();
    expect(screen.queryByText("Queen's Computing Society")).not.toBeInTheDocument();
    expect(screen.getByText("Queen's Docs")).toBeInTheDocument();
  });

  it("shows loading state while fetching data", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolveClubsPromise: (value: any) => void;
    const clubsPromise = new Promise((resolve) => {
      resolveClubsPromise = resolve;
    });

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/clubs")) {
        return Promise.resolve({
          ok: true,
          json: () => clubsPromise,
        });
      } else if (url.includes("/universities")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockUniversities,
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(<ClubsPage />);
    
    expect(screen.getByText("Loading clubs...")).toBeInTheDocument();
    
    resolveClubsPromise!(mockClubs);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading clubs...")).not.toBeInTheDocument();
      expect(screen.getByText("Queen's Fencing Club")).toBeInTheDocument();
    });
  });

  it("shows no clubs found message when filtered results are empty", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/clubs")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockClubs,
        });
      } else if (url.includes("/universities")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockUniversities,
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(<ClubsPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Queen's Fencing Club")).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId("filter-search");
    fireEvent.change(searchInput, { target: { value: "nonexistent club" } });

    expect(screen.getByText("No clubs found.")).toBeInTheDocument();
  });
});
