import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (payload: object): string => {
  const SECRET_KEY = process.env.JWT_SECRET;
  if (!SECRET_KEY) {
    throw new Error("Missing JWT_SECRET environment variable");
  }
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "16h" });
};

export const generateStudentToken = (studentNumber: number) => {
  const SECRET_KEY = process.env.JWT_SECRET;
  if (!SECRET_KEY) {
    throw new Error("Missing JWT_SECRET environment variable");
  }

  return jwt.sign({ studentNumber }, SECRET_KEY!, { expiresIn: "24h" });
};

export const generateVerificationToken = (userId: number) => {
  const SECRET_KEY = process.env.JWT_SECRET;
  if (!SECRET_KEY) {
    throw new Error("Missing JWT_SECRET environment variable");
  }
  return jwt.sign({ userId }, SECRET_KEY!, { expiresIn: "1h" });
};

export const generateResetToken = (email: string) => {
  const SECRET_KEY = process.env.JWT_SECRET;
  if (!SECRET_KEY) {
    throw new Error("Missing JWT_SECRET environment variable");
  }
  return jwt.sign({ email }, SECRET_KEY!, { expiresIn: "1h" });
};

export const generateRequestToken = (reqId: number) => {
  const SECRET_KEY = process.env.JWT_SECRET;
  if (!SECRET_KEY) {
    throw new Error("Missing JWT_SECRET environment variable");
  }
  return jwt.sign({ reqId }, SECRET_KEY!, { expiresIn: "48h" });
};
