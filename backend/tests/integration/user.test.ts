import request from "supertest";
import app from "../../src/index";
import { getAllClubs } from "../../src/utils/user";
import stripe from "../../src/utils/stripe";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockStripe = stripe as jest.Mocked<typeof stripe>;

jest.mock("../../src/utils/user", () => ({
  getAllClubs: jest.fn(),
}));

jest.mock("../../src/utils/authentication", () => ({
  ...jest.requireActual("../../src/utils/authentication"),
  authenticateToken: jest.fn((req, res, next) => {
    if (req.headers["authorization"]) {
      req.user = { id: 1 };
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  }),
}));

describe("Users API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch all clubs for an authenticated user", async () => {
    (getAllClubs as jest.Mock).mockResolvedValue([
      { id: 1, name: "Mock Club 1" },
      { id: 2, name: "Mock Club 2" },
    ]);

    const res = await request(app)
      .get("/user/clubs")
      .set("Authorization", "Bearer valid_mock_token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, name: "Mock Club 1" },
      { id: 2, name: "Mock Club 2" },
    ]);
    expect(getAllClubs).toHaveBeenCalledWith(1);
  });

  it("should return an empty array if the user is not a member of any clubs", async () => {
    (getAllClubs as jest.Mock).mockResolvedValue([]);

    const res = await request(app)
      .get("/user/clubs")
      .set("Authorization", "Bearer valid_mock_token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    expect(getAllClubs).toHaveBeenCalledWith(1);
  });

  it("should return 401 if the user is not authenticated", async () => {
    const res = await request(app).get("/user/clubs");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message", "Unauthorized");
    expect(getAllClubs).not.toHaveBeenCalled();
  });

  it("should handle errors from the getAllClubs function", async () => {
    (getAllClubs as jest.Mock).mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .get("/user/clubs")
      .set("Authorization", "Bearer valid_mock_token");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("message", "Internal server error");
    expect(getAllClubs).toHaveBeenCalledWith(1);
  });
});
