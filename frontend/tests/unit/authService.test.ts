import { login } from "../../src/services/authService";

describe("authService", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  it("returns a token when login is successful", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ token: "mock-token" }),
    });

    const token = await login("test@example.com", "password123");

    expect(token).toBe("mock-token");
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      }
    );
  });

  it("throws an error when login fails with a server message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "Invalid credentials" }),
    });

    await expect(login("test@example.com", "wrongpassword")).rejects.toThrow(
      "Invalid credentials"
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("throws a default error message when login fails without a server message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    });

    await expect(login("test@example.com", "password123")).rejects.toThrow(
      "Login failed"
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
