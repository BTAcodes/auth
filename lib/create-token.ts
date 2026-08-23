import { ROLE } from "@/app/generated/prisma/enums";
import jwt from "jsonwebtoken";
export function createToken(userId: string, role: ROLE) {
  const accessSecret = process.env.ACCESS_TOKEN_SECRET;

  if (!accessSecret) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }
  const accessToken = jwt.sign({ userId, role }, accessSecret, {
    expiresIn: "15m",
  });

  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
  if (!refreshSecret) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined");
  }
  const refreshToken = jwt.sign({ userId, role }, refreshSecret, {
    expiresIn: "7d",
  });
  return {
    accessToken,
    refreshToken,
  };
}
