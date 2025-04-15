import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Dashboard from "../../src/pages/Dashboard";
import React from "react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../src/utils/auth";

// eslint-disable-next-line react/display-name
jest.mock("../../src/components/Navbar", () => () => (
  <div data-testid="navbar">Navbar</div>
));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../src/utils/auth", () => ({
  isAuthenticated: jest.fn(),
}));

describe("Dashboard Integration Test", () => {
  const mockNavigate = jest.fn();
  
  beforeAll(() => {
    global.fetch = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (isAuthenticated as jest.Mock).mockReturnValue(true);
    (window.localStorage.getItem as jest.Mock).mockReturnValue("fake-token");
  });

  it("renders components together", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/auth/user")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ name: "Test User", email: "test@example.com" })
        });
      } else if (url.includes("/user/clubs")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              name: "Queen's Fencing Club",
              shortdescription: "Olympic Fencing @ QUB",
              image: "https://club-images-dev.s3.us-east-1.amazonaws.com/fencingimage.webp",
              iscommittee: true,
              status: "Active"
            }
          ])
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome, Test User!")).toBeInTheDocument();
    });
    
    expect(screen.getByText("Queen's Fencing Club")).toBeInTheDocument();
    expect(screen.getByText("Olympic Fencing @ QUB")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Details" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Committee View" })).toBeInTheDocument();
  });

  it("renders no clubs found message when no clubs are available", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/auth/user")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ name: "Test User", email: "test@example.com" })
        });
      } else if (url.includes("/user/clubs")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No clubs found...")).toBeInTheDocument();
    });
    
    expect(screen.getByRole("button", { name: "Browse Clubs" })).toBeInTheDocument();
  });

  it("redirects to login when token is missing", async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login?redirect=/dashbaord");
    });
  });

  it("redirects to login when user API call fails", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/auth/user")) {
        return Promise.resolve({
          ok: false
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(window.localStorage.removeItem).toHaveBeenCalledWith("token");
      expect(mockNavigate).toHaveBeenCalledWith("/login?redirect=/dashboard");
    });
  });

  it("handles API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(window.localStorage.removeItem).toHaveBeenCalledWith("token");
      expect(mockNavigate).toHaveBeenCalledWith("/login?redirect=/dashboard");
    });
  });

  it("filters clubs based on search query", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/auth/user")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ name: "Test User", email: "test@example.com" })
        });
      } else if (url.includes("/user/clubs")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              name: "Queen's Fencing Club",
              shortdescription: "Olympic Fencing @ QUB",
              image: "https://example.com/fencing.jpg",
              iscommittee: true,
              status: "Active"
            },
            {
              id: 2,
              name: "Chess Club",
              shortdescription: "Strategic board games",
              image: "https://example.com/chess.jpg",
              iscommittee: false,
              status: "Active"
            }
          ])
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Queen's Fencing Club")).toBeDefined();
      expect(screen.getByText("Chess Club")).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "chess" } });

    expect(screen.queryByText("Queen's Fencing Club")).not.toBeInTheDocument();
    expect(screen.getByText("Chess Club")).toBeInTheDocument();
  });

  it("displays inactive membership warning for expired clubs", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/auth/user")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ name: "Test User", email: "test@example.com" })
        });
      } else if (url.includes("/user/clubs")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              name: "Expired Club",
              shortdescription: "This membership has expired",
              image: "https://example.com/expired.jpg",
              iscommittee: false,
              status: "Expired",
              membershipticket: "ticket123"
            }
          ])
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Expired Club")).toBeDefined();
    });

    expect(screen.getByText("Membership Inactive")).toBeDefined();
    expect(screen.getByText(/Purchase it/)).toBeDefined();
    expect(screen.getByText("HERE")).toHaveAttribute("href", "/payment/ticket123");
  });

  it("navigates to club details when View Details button is clicked", async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes("/auth/user")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ name: "Test User", email: "test@example.com" })
        });
      } else if (url.includes("/user/clubs")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              name: "Test Club",
              shortdescription: "Test Description",
              image: "https://example.com/test.jpg",
              iscommittee: false,
              status: "Active"
            }
          ])
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Club")).toBeDefined();
    });

    const viewDetailsButton = screen.getByRole("button", { name: "View Details" });
    fireEvent.click(viewDetailsButton);

    expect(mockNavigate).toHaveBeenCalledWith("/club/1");
  });
});
