import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/home", "/sessions"];
const publicRoutes = [
  "/",
  "/signup",
  "/confirm-account",
  "/forgot-password",
  "/rest-password",
  "/verify-mfa",
];

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
  const hasAccessToken = request.cookies.has("accessToken");
  const hasRefreshToken = request.cookies.has("refreshToken");

  if (isProtectedRoute && !hasAccessToken) {
    if (hasRefreshToken) {
      // try getting a new access token
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  if (isPublicRoute && hasAccessToken) {
    return NextResponse.redirect(new URL("/home", request.nextUrl));
  }
  return NextResponse.next();
}
