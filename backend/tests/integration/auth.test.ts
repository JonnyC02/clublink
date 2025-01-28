import request from "supertest";
import app from "../../src/index";
import pool from "../../src/db/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../../src/utils/email";
import { generateVerificationToken } from "../../src/utils/tokens";
import stripe from "../../src/utils/stripe";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockStripe = stripe as jest.Mocked<typeof stripe>;

jest.mock("../../src/utils/stripe", () => ({
  paymentIntents: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
}));

jest.mock("../../src/db/db", () => ({
  query: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock("../../src/utils/email", () => ({
  sendVerificationEmail: jest.fn(),
}));

jest.mock("../../src/utils/tokens", () => ({
  generateVerificationToken: jest.fn(),
}));

jest.mock("../../src/utils/authentication", () => ({
  ...jest.requireActual("../../src/utils/authentication"),
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: 1 };
    next();
  }),
}));

const mockQuery = pool.query as jest.Mock;
const mockHash = bcrypt.hash as jest.Mock;
const mockCompare = bcrypt.compare as jest.Mock;
const mockSign = jwt.sign as jest.Mock;
const mockVerify = jwt.verify as jest.Mock;
const mockSendVerificationEmail = sendVerificationEmail as jest.Mock;
const mockGenerateVerificationToken = generateVerificationToken as jest.Mock;

describe("Authentication API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/login", () => {
    it("should log in successfully with valid credentials", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: "test@example.com",
            password: "hashed_password",
            isactive: true,
          },
        ],
      });
      mockCompare.mockResolvedValueOnce(true);
      mockSign.mockReturnValueOnce("mock_token");

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token", "mock_token");
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        ["test@example.com"]
      );
      expect(mockCompare).toHaveBeenCalledWith(
        "password123",
        "hashed_password"
      );
      expect(mockSign).toHaveBeenCalledWith(
        { id: 1, email: "test@example.com" },
        expect.any(String),
        {
          expiresIn: "24h",
        }
      );
    });

    it("should return 403 if email is not verified", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: "test@example.com",
            password: "hashed_password",
            isactive: false,
          },
        ],
      });

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("message", "Your email is not verified!");
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it("should return 401 for invalid credentials", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: "test@example.com",
            password: "hashed_password",
            isactive: true,
          },
        ],
      });
      mockCompare.mockResolvedValueOnce(false);

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid email or password");
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /auth/signup", () => {
    it("should sign up a new user and send a verification email", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // No existing user
      mockHash.mockResolvedValueOnce("hashed_password");
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, name: "Test User", email: "test@example.com" }],
      });
      mockGenerateVerificationToken.mockReturnValueOnce(
        "mock_verification_token"
      );

      const res = await request(app).post("/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message", "User created!");
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockHash).toHaveBeenCalledWith("password123", 10);
      expect(mockGenerateVerificationToken).toHaveBeenCalledWith(1);
      expect(mockSendVerificationEmail).toHaveBeenCalledWith(
        "test@example.com",
        "mock_verification_token"
      );
    });

    it("should return 400 if email is already in use", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1, email: "test@example.com" }],
      });

      const res = await request(app).post("/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Email already in use");
    });
  });

  describe("GET /auth/verify", () => {
    it("should verify the user email", async () => {
      mockVerify.mockReturnValueOnce({ userId: 1 });
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const token = jwt.sign({ userId: 1 }, "testingsecret");
      const res = await request(app).get("/auth/verify").query({ token });

      expect(res.status).toBe(200);
      expect(res.text).toBe("Email verified successfully!");
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining(
          "UPDATE users SET isActive = true WHERE id = $1"
        ),
        [1]
      );
    });

    it("should return 400 for an invalid or expired token", async () => {
      mockVerify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const res = await request(app)
        .get("/auth/verify")
        .query({ token: "invalid_token" });

      expect(res.status).toBe(400);
      expect(res.text).toBe("Invalid or expired token.");
    });
  });

  describe("GET /auth/user", () => {
    it("should fetch user details for an authenticated user", async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              name: "Test User",
              email: "test@example.com",
              university: "Test University",
              studentNumber: "12345",
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ id: 1, name: "Test Club" }],
        });

      const res = await request(app)
        .get("/auth/user")
        .set("Authorization", "Bearer valid_token");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        name: "Test User",
        email: "test@example.com",
        isStudent: true,
        studentNumber: "12345",
        university: "Test University",
      });
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });
});
