import {
  generateToken,
  generateVerificationToken,
} from "../../src/utils/tokens";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("Token Utils", () => {
  const mockPayload = { id: 1, email: "test@example.com" };
  const mockUserId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateToken", () => {
    it("should throw an error if SECRET_KEY is missing during function call", () => {
      const originalSecretKey = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => generateToken(mockPayload)).toThrow(
        "Missing JWT_SECRET environment variable"
      );

      process.env.JWT_SECRET = originalSecretKey;
    });

    it("should generate a token if SECRET_KEY is defined", () => {
      const originalSecretKey = process.env.JWT_SECRET;
      process.env.JWT_SECRET = "mockSecret";

      (jwt.sign as jest.Mock).mockReturnValue("mockToken");

      const token = generateToken(mockPayload);
      expect(token).toBe("mockToken");
      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, "mockSecret", {
        expiresIn: "16h",
      });

      process.env.JWT_SECRET = originalSecretKey;
    });

    it("should use the correct payload and options when generating a token", () => {
      process.env.JWT_SECRET = "mockSecret";

      (jwt.sign as jest.Mock).mockReturnValue("mockToken");

      generateToken(mockPayload);
      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, "mockSecret", {
        expiresIn: "16h",
      });
    });
  });

  describe("generateVerificationToken", () => {
    it("should throw an error if SECRET_KEY is missing during function call", () => {
      const originalSecretKey = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => generateVerificationToken(mockUserId)).toThrow(
        "Missing JWT_SECRET environment variable"
      );

      process.env.JWT_SECRET = originalSecretKey;
    });

    it("should generate a verification token if SECRET_KEY is defined", () => {
      const originalSecretKey = process.env.JWT_SECRET;
      process.env.JWT_SECRET = "mockSecret";

      (jwt.sign as jest.Mock).mockReturnValue("mockVerificationToken");

      const token = generateVerificationToken(mockUserId);
      expect(token).toBe("mockVerificationToken");
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUserId },
        "mockSecret",
        { expiresIn: "1h" }
      );

      process.env.JWT_SECRET = originalSecretKey;
    });

    it("should use the correct payload and options when generating a verification token", () => {
      process.env.JWT_SECRET = "mockSecret";

      (jwt.sign as jest.Mock).mockReturnValue("mockVerificationToken");

      generateVerificationToken(mockUserId);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUserId },
        "mockSecret",
        { expiresIn: "1h" }
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle cases where SECRET_KEY is undefined", () => {
      const originalSecretKey = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => generateToken(mockPayload)).toThrow(
        "Missing JWT_SECRET environment variable"
      );
      expect(() => generateVerificationToken(mockUserId)).toThrow(
        "Missing JWT_SECRET environment variable"
      );

      process.env.JWT_SECRET = originalSecretKey;
    });

    it("should handle JWT sign errors gracefully", () => {
      process.env.JWT_SECRET = "mockSecret";

      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error("JWT signing error");
      });

      expect(() => generateToken(mockPayload)).toThrow("JWT signing error");
      expect(() => generateVerificationToken(mockUserId)).toThrow(
        "JWT signing error"
      );
    });
  });
});
