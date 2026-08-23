import { NextResponse } from "next/server";

export function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    },
    {
      status: 200,
    },
  );

  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");

  return response;
}