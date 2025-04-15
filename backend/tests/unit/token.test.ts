import {
  generateRequestToken,
  generateResetToken,
  generateStudentToken,
  generateToken,
  generateVerificationToken,
} from "../../src/utils/tokens";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("Token Utils", () => {
  const mockPayload = { id: 1, email: "test@example.com" };
  const mockStudentPayload = 12345;
  const mockResetPayload = "test@example.com";
  const mockUserId = 1;
  const mockRequestId = 4;

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

  describe("generateStudentToken", () => {
    it("should generate a student verification token if SECRET_KEY is defined", () => {
      const originalSecretKey = process.env.JWT_SECRET;
      process.env.JWT_SECRET = "mockSecret";

      (jwt.sign as jest.Mock).mockReturnValue("mockVerificationToken");

      const token = generateStudentToken(mockUserId);
      expect(token).toBe("mockVerificationToken");
      expect(jwt.sign).toHaveBeenCalledWith(
        { studentNumber: mockUserId },
        "mockSecret",
        { expiresIn: "24h" }
      );

      process.env.JWT_SECRET = originalSecretKey;
    });

    it("should use the correct payload and options when generating a student verification token", () => {
      process.env.JWT_SECRET = "mockSecret";

      (jwt.sign as jest.Mock).mockReturnValue("mockVerificationToken");

      generateStudentToken(mockStudentPayload);
      expect(jwt.sign).toHaveBeenCalledWith(
        { studentNumber: mockStudentPayload },
        "mockSecret",
        {
          expiresIn: "24h",
        }
      );
    });
  });

  describe("generateResetToken", () => {
    it("should generate a reset token if SECRET_KEY is defined", () => {
      const originalSecretKey = process.env.JWT_SECRET;
      process.env.JWT_SECRET = "mockSecret";

      (jwt.sign as jest.Mock).mockReturnValue("mockVerificationToken");

      const token = generateResetToken(mockResetPayload);
      expect(token).toBe("mockVerificationToken");
      expect(jwt.sign).toHaveBeenCalledWith(
        { email: mockResetPayload },
        "mockSecret",
        { expiresIn: "1h" }
      );

      process.env.JWT_SECRET = originalSecretKey;
    });

    it("should use the correct payload and options when generating a reset token", () => {
      process.env.JWT_SECRET = "mockSecret";

      (jwt.sign as jest.Mock).mockReturnValue("mockVerificationToken");

      generateResetToken(mockResetPayload);
      expect(jwt.sign).toHaveBeenCalledWith(
        { email: mockResetPayload },
        "mockSecret",
        {
          expiresIn: "1h",
        }
      );
    });
  });

  describe("generateRequestToken", () => {
    it("should generate a request token if SECRET_KEY is defined", () => {
      const originalSecretKey = process.env.JWT_SECRET;
      process.env.JWT_SECRET = "mockSecret";

      (jwt.sign as jest.Mock).mockReturnValue("mockVerificationToken");

      const token = generateRequestToken(mockRequestId);
      expect(token).toBe("mockVerificationToken");
      expect(jwt.sign).toHaveBeenCalledWith(
        { reqId: mockRequestId },
        "mockSecret",
        { expiresIn: "48h" }
      );

      process.env.JWT_SECRET = originalSecretKey;
    });
    it("should use the correct payload and options when generating a request token", () => {
      process.env.JWT_SECRET = "mockSecret";

      (jwt.sign as jest.Mock).mockReturnValue("mockVerificationToken");

      generateRequestToken(mockRequestId);
      expect(jwt.sign).toHaveBeenCalledWith(
        { reqId: mockRequestId },
        "mockSecret",
        {
          expiresIn: "48h",
        }
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

      expect(() => generateStudentToken(mockStudentPayload)).toThrow(
        "Missing JWT_SECRET environment variable"
      );

      expect(() => generateResetToken(mockResetPayload)).toThrow(
        "Missing JWT_SECRET environment variable"
      );

      expect(() => generateRequestToken(mockRequestId)).toThrow(
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
