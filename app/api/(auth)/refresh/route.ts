import { createToken } from "@/lib/create-token";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/verify-token";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "لاتمتلك الصلاحية للوصول" },
        { status: 401 },
      );
    }
    const decoded = verifyToken(refreshToken, "refresh");
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "لاتمتلك الصلاحية للوصول",
        },
        {
          status: 401,
        },
      );
    }
    const { accessToken } = createToken(user.id, user.role);
    const response = NextResponse.json(
      { success: true, message: "تم تجديد التوكن" },
      { status: 200 },
    );
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });
    return response;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "TOKEN_EXPIRED" || error.message === "INVALID_TOKEN")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Refresh token غير صالح أو منتهي",
        },
        {
          status: 401,
        },
      );
    }
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ في السيرفر",
      },
      {
        status: 500,
      },
    );
  }
}
