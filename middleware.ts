import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "./env";
import {jwtVerify} from "jose";
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (request.nextUrl.pathname.startsWith('/api/trpc')) {
    const authHeader = request.headers.get('authorization');

    // Check if request is from mobile app
    const userAgent = request.headers.get('user-agent') || '';
    const isMobileApp = userAgent.includes('Expo') ||
      request.headers.get('x-app-platform') === 'mobile';

    // If it's a mobile app request, require authentication
    if (isMobileApp) {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized - Missing token' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        // Verify JWT token
        const secret = new TextEncoder().encode(
          env.JWT_SECRET || 'your-secret-key'
        );

        const { payload } = await jwtVerify(token, secret);

        // Add user info to headers for tRPC context
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.userId as string);
        requestHeaders.set('x-user-role', payload.role as string);
        requestHeaders.set('x-user-email', payload.email as string);

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid token' },
          { status: 401 }
        );
      }
    }
  }
  // Get the token from NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Public routes that don't require authentication
  const publicRoutes = ['/signin', '/signup', '/api/signin', '/'];
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
    ADMIN: ['/admin', '/dashboard'],
    HOSPITAL_ADMIN: ['/hospital', '/dashboard'],
    DOCTOR: ['/doctor', '/dashboard'],
  };

  // Check if user is accessing the right routes for their role
  let hasAccess = false;

  if (userRole in roleRouteMap) {
    const allowedRoutes = roleRouteMap[userRole as keyof typeof roleRouteMap];
    hasAccess = allowedRoutes.some(route => pathname.startsWith(route));
  }

  // Allow access to general protected routes like /api, /settings, etc.
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
        redirectPath = '/hospital/dashboard';
        break;
      case 'DOCTOR':
        redirectPath = '/doctor/dashboard';
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