import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createToken } from "@/lib/create-token";
import { getCurrentUser } from "@/lib/get-current-user";
export async function POST(request: Request) {
  try {
    const userCount = await prisma.user.count();

    if (userCount > 0) {
      const currentUser = await getCurrentUser();

      if (!currentUser || currentUser.role !== "OWNER") {
        return NextResponse.json(
          {
            success: false,
            message: "ليس لديك صلاحية لإنشاء مستخدم",
          },
          {
            status: 403,
          },
        );
      }
    }
    const { userName, password } = await request.json();

    if (!userName || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "جميع الحقول الزامية",
        },
        {
          status: 400,
        },
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" },
        { status: 400 },
      );
    }
    const user = await prisma.user.findUnique({
      where: {
        userName,
      },
    });

    if (user) {
      return NextResponse.json(
        {
          success: false,
          message: "المستخدم موجود مسبقًا",
        },
        {
          status: 400,
        },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: {
        userName,
        password: hashedPassword,
      },
    });
    const { accessToken, refreshToken } = createToken(newUser.id, newUser.role);
    const response = NextResponse.json(
      {
        success: true,
        message: "تم إنشاء الحساب بنجاح",
      },
      {
        status: 201,
      },
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
