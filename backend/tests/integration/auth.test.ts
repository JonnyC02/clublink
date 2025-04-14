jest.mock("../../src/utils/stripe", () => ({
  paymentIntents: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
}));

import request from "supertest";
import app from "../../src/index";
import * as db from "../../src/db/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendEmail } from "../../src/utils/email";
import {
  generateVerificationToken,
  generateResetToken,
} from "../../src/utils/tokens";
import { stopQueue } from "../../src/utils/queue";

process.env.JWT_SECRET = "testingsecret";

jest.mock("../../src/db/db", () => {
  const mockQuery = jest.fn();
  return {
    __esModule: true,
    default: { query: mockQuery },
    pool: { query: mockQuery },
  };
});

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
  sendStudentVerifyEmail: jest.fn(),
  sendEmail: jest.fn(),
}));

jest.mock("../../src/utils/tokens", () => ({
  generateVerificationToken: jest.fn(),
  generateStudentToken: jest.fn(),
  generateResetToken: jest.fn(),
}));

jest.mock("../../src/utils/authentication", () => ({
  ...jest.requireActual("../../src/utils/authentication"),
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: 1 };
    next();
  }),
}));

const mockQuery = db.default.query as jest.Mock;
const mockHash = bcrypt.hash as jest.Mock;
const mockCompare = bcrypt.compare as jest.Mock;
const mockSign = jwt.sign as jest.Mock;
const mockVerify = jwt.verify as jest.Mock;
const mockSendVerificationEmail = sendVerificationEmail as jest.Mock;
const mockSendEmail = sendEmail as jest.Mock;
const mockGenerateVerificationToken = generateVerificationToken as jest.Mock;
const mockGenerateResetToken = generateResetToken as jest.Mock;

describe("Authentication API Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    stopQueue();
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

    it("should return 401 if user is not found", async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "missing@user.com", password: "wrong" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should return 500 on unexpected server error", async () => {
      mockQuery.mockRejectedValueOnce(new Error("DB failure"));

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "user@test.com", password: "123456" });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Internal Server Error");
    });
  });

  describe("POST /auth/signup", () => {
    it("should sign up a new user and send a verification email", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });
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

    it("should handle failure to send verification email", async () => {
      mockSendVerificationEmail.mockRejectedValueOnce(new Error("Mail error"));

      const res = await request(app).post("/auth/signup").send({
        email: "test@example.com",
        name: "Test User",
        password: "12345",
      });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Internal Server Error");
    });

    it("should return 400 if email is missing", async () => {
      const res = await request(app).post("/auth/resend-verification").send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email is required");
    });

    it("should return 400 if user not found or inactive", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post("/auth/resend-verification")
        .send({ email: "noone@here.com" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid Request");
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

  describe("POST /auth/signup (student flow)", () => {
    it("should return 400 if student number already exists", async () => {
      mockQuery.mockReset();
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const res = await request(app).post("/auth/signup").send({
        name: "Student",
        email: "student@example.com",
        password: "password123",
        studentNumber: "S12345",
        university: "UNI",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "Student Number Already in use!"
      );
    });

    it("should return 500 if university is not found", async () => {
      mockQuery.mockReset();
      mockQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app).post("/auth/signup").send({
        name: "Student",
        email: "student@example.com",
        password: "password123",
        studentNumber: "S12345",
        university: "UNKNOWN",
      });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty(
        "message",
        "Your University has not been setup for ClubLink"
      );
    });
  });

  describe("GET /auth/student", () => {
    it("should verify student status with valid token", async () => {
      mockVerify.mockReturnValueOnce({ studentNumber: "S12345" });
      mockQuery.mockResolvedValueOnce({});

      const token = jwt.sign({ studentNumber: "S12345" }, "testingsecret");
      const res = await request(app).get("/auth/student").query({ token });

      expect(res.status).toBe(200);
      expect(res.text).toBe("Student Status Verified Successfully!");
    });
  });

  describe("POST /auth/forgot-password", () => {
    it("should send reset email if user exists", async () => {
      mockQuery.mockReset();
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      mockGenerateResetToken.mockReturnValue("reset-token");

      const res = await request(app)
        .post("/auth/forgot-password")
        .send({ email: "reset@example.com" });

      expect(mockSendEmail).toHaveBeenCalledWith(
        "reset@example.com",
        expect.objectContaining({
          subject: expect.stringContaining("Password Reset"),
        })
      );
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "Password reset email sent!");
    });
  });

  describe("POST /auth/reset-password", () => {
    it("should reset password with valid token", async () => {
      mockVerify.mockReturnValueOnce({ email: "reset@example.com" });
      mockHash.mockResolvedValueOnce("hashed_pw");
      mockQuery.mockResolvedValueOnce({});

      const res = await request(app).post("/auth/reset-password").send({
        token: "valid_token",
        newPassword: "new_pass",
      });

      expect(mockQuery).toHaveBeenCalledWith(
        "UPDATE users SET password = $1 WHERE email = $2",
        ["hashed_pw", "reset@example.com"]
      );
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Password Successfully Updated"
      );
    });
  });
});
