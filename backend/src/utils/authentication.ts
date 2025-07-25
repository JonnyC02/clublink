import { Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthRequest } from "../types/AuthRequest";

dotenv.config();

// deepcode ignore HardcodedSecret: secret is just for testing
const SECRET_KEY: string = process.env.JWT_SECRET || "testingsecret";

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers?.["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access Token Required" });
    return;
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY) as JwtPayload;

    if (typeof payload === "object" && "id" in payload && "email" in payload) {
      req.user = {
        id: payload.id as number,
        email: payload.email as string,
      };
      next();
    } else {
      res.status(403).json({ message: "Invalid Token Structure" });
    }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(403).json({ message: "Token has expired" });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: "Invalid Token" });
    } else {
      console.error("Token verification error:", err); // eslint-disable-line no-console
      res.status(403).json({ message: "Invalid Token" });
    }
  }
};

export const getUserId = (authHeader: string | undefined) => {
  if (!authHeader) return undefined;

  const token = authHeader.split(" ")[1] || "";
  if (token === "null" || token === "") return undefined;

  try {
    const payload = jwt.verify(token, SECRET_KEY) as JwtPayload;
    if (typeof payload === "object" && "id" in payload && "email" in payload) {
      return payload.id;
    }
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      console.warn("Token has expired:", err.expiredAt); // eslint-disable-line no-console
      return undefined;
    }
    console.error("Token Verification Error: ", err); // eslint-disable-line no-console
    return undefined;
  }
};
