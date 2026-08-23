import { ROLE } from "@/app/generated/prisma/enums";
import jwt from "jsonwebtoken";

type TokenPayload = {
  userId: string;
  role: ROLE;
};

export function verifyToken(token: string, type: "access" | "refresh") {
  const secret =
    type === "access"
      ? process.env.ACCESS_TOKEN_SECRET
      : process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("Token secret is not defined");
  }
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("TOKEN_EXPIRED");
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("INVALID_TOKEN");
    }
    throw error;
  }
}
