import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createToken } from "@/lib/create-token";

export async function POST(request: Request) {
  try {
    const { userName, password } = await request.json();
    if (!userName || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم المستخدم وكلمة المرور مطلوبة",
        },
        { status: 400 },
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        userName,
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم المستخدم أو كلمة المرور غير صحيحة",
        },
        { status: 401 },
      );
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم المستخدم أو كلمة المرور غير صحيحة",
        },
        { status: 401 },
      );
    }
    const { accessToken, refreshToken } = createToken(user.id, user.role);
    const response = NextResponse.json(
      { success: true, message: "تم تسجيل الدخول بنجاح" },
      { status: 200 },
    );
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
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
