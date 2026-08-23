import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/verify-token";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token, "access");

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });
    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
}
