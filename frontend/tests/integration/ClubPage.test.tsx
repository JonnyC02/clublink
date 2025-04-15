/* eslint-disable react/display-name */
import { render, screen, waitFor } from "@testing-library/react";
import ClubPage from "../../src/pages/ClubPage";
import React from "react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../src/utils/auth";

jest.mock("../../src/components/Navbar", () => () => (
  <div data-testid="navbar">Navbar</div>
));

jest.mock("../../src/components/TitleSection", () => () => (
  <div data-testid="titlesection">Title Section</div>
));

jest.mock("../../src/components/NotificationBanner", () => ({ 
  type, 
  message, 
  onClose 
}: { 
  type: "success" | "error"; 
  message: string; 
  onClose: () => void;
}) => (
  <div data-testid={`notification-${type}`}>
    {message}
    <button onClick={onClose}>Close</button>
  </div>
));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../src/utils/auth", () => ({
  isAuthenticated: jest.fn(),
}));

describe("Club Page Integration Test", () => {
  const mockNavigate = jest.fn();
  
  beforeAll(() => {
    global.fetch = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (isAuthenticated as jest.Mock).mockReturnValue(false);
    (window.localStorage.getItem as jest.Mock).mockReturnValue("fake-token");
  });

  const mockClubData = {
    Club: {
      id: 1,
      name: "Test Club",
      email: "test@club.com",
      description: "This is a test club description",
      shortdescription: "Test club short description",
      image: "https://example.com/image.jpg",
      headerimage: "https://example.com/header.jpg",
      university: "QUB",
      clubtype: "Society",
      popularity: 10,
      ratio: 0.5,
    },
    ismember: false,
    hasPending: false,
  };

  const mockCommitteeMembers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "President",
      image: "https://example.com/john.jpg",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Secretary",
      image: "https://example.com/jane.jpg",
    },
  ];

  it("handles API error gracefully", async () => {
    // Mock failed API response
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/clubs/1")) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: "Failed to fetch club data" }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });
  
    render(
      <MemoryRouter initialEntries={["/club/1"]}>
        <Routes>
          <Route path="/club/:id" element={<ClubPage />} />
        </Routes>
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(screen.getByText("An error occurred while fetching data.")).toBeInTheDocument();
    });
  });

  it("handles network error gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(
      <MemoryRouter initialEntries={["/club/1"]}>
        <Routes>
          <Route path="/club/:id" element={<ClubPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("An error occurred while fetching data.")).toBeInTheDocument();
    });
  });

  it("handles successful club join", async () => {
    (isAuthenticated as jest.Mock).mockReturnValue(true);
    
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/clubs/1")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockClubData),
        });
      } else if (url.includes("/committee")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCommitteeMembers),
        });
      } else if (url.includes("/clubs/join/1")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ticket: "ticket123" }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(
      <MemoryRouter initialEntries={["/club/1"]}>
        <Routes>
          <Route path="/club/:id" element={<ClubPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("An error occurred while fetching data.")).toBeInTheDocument();
    });
  });

  it("handles failed club join", async () => {
    (isAuthenticated as jest.Mock).mockReturnValue(true);
    
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/clubs/1")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockClubData),
        });
      } else if (url.includes("/committee")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCommitteeMembers),
        });
      } else if (url.includes("/clubs/join/1")) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: "Failed to join club" }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(
      <MemoryRouter initialEntries={["/club/1"]}>
        <Routes>
          <Route path="/club/:id" element={<ClubPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("An error occurred while fetching data.")).toBeInTheDocument();
    });
  });

  it("displays committee error when no committee members", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/clubs/1")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockClubData),
        });
      } else if (url.includes("/committee")) {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ message: "No committee members found" }),
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(
      <MemoryRouter initialEntries={["/club/1"]}>
        <Routes>
          <Route path="/club/:id" element={<ClubPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("An error occurred while fetching data.")).toBeInTheDocument();
    });
  });
});
