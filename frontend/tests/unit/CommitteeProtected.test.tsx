import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CommitteeProtected from "../../src/components/CommitteeProtected";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({ id: "1" }),
}));

describe("CommitteeProtected", () => {
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch;
    jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockReturnValue("mock-token");
    process.env.REACT_APP_API_URL = "http://mock-api";
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders loading state initially", async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={["/club/1/committee"]}>
        <Routes>
          <Route
            path="/club/:id/committee"
            element={
              <CommitteeProtected>
                <div>Protected Content</div>
              </CommitteeProtected>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading.../i)).toBeDefined();
  });

  it("renders children when user is a committee member", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isCommittee: true }),
    });

    render(
      <MemoryRouter initialEntries={["/club/1/committee"]}>
        <Routes>
          <Route
            path="/club/:id/committee"
            element={
              <CommitteeProtected>
                <div>Protected Content</div>
              </CommitteeProtected>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/Protected Content/i)).toBeDefined()
    );
  });

  it("redirects to /login when user is not a committee member", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isCommittee: false }),
    });

    render(
      <MemoryRouter initialEntries={["/club/1/committee"]}>
        <Routes>
          <Route
            path="/club/:id/committee"
            element={
              <CommitteeProtected>
                <div>Protected Content</div>
              </CommitteeProtected>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Login Page/i)).toBeDefined());
  });

  it("fetches the correct API endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ isCommittee: true }),
    });

    render(
      <MemoryRouter initialEntries={["/club/1/committee"]}>
        <Routes>
          <Route
            path="/club/:id/committee"
            element={
              <CommitteeProtected>
                <div>Protected Content</div>
              </CommitteeProtected>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/clubs/1/is-committee",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );
    });
  });
});
