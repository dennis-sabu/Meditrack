import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get the token from NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Public routes that don't require authentication
  const publicRoutes = ['/signin', '/signup', '/api/auth', '/admin/login','/'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If accessing public route, continue
  if (isPublicRoute) {
    const response = NextResponse.next();
    response.headers.set("x-current-path", pathname);
    return response;
  }

  // If no token and trying to access protected route, redirect to signin
  if (!token) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  const userRole = token.role as string;

  // Role-based route protection
  const roleRouteMap = {
    ADMIN: ['/admin/dashboard'],
    HOSPITAL_ADMIN: ['/hospitals','/hospitals/dashboard'],
    DOCTOR: ['/doctors','/doctors/dashboard'],
  };

  // Check if user is accessing the right routes for their role
  let hasAccess = false;

  if (userRole in roleRouteMap) {
    const allowedRoutes = roleRouteMap[userRole as keyof typeof roleRouteMap];
    hasAccess = allowedRoutes.some(route => pathname.startsWith(route));
  }

  // // Allow access to general protected routes like /api, /settings, etc.
  const generalProtectedRoutes = ['/api', '/settings', '/profile'];
  if (generalProtectedRoutes.some(route => pathname.startsWith(route))) {
    hasAccess = true;
  }

  // If user doesn't have access, redirect to their appropriate dashboard
  if (!hasAccess) {
    let redirectPath = '/signin';

    switch (userRole) {
      case 'ADMIN':
        redirectPath = '/admin/dashboard';
        break;
      case 'HOSPITAL_ADMIN':
        redirectPath = '/hospitals/dashboard';
        break;
      case 'DOCTOR':
        redirectPath = '/doctors/dashboard';
        break;
      default:
        redirectPath = '/signin';
    }

    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-current-path", pathname);
  response.headers.set("x-user-role", userRole);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}