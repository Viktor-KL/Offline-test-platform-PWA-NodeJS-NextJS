import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/results', '/tests'];
const publicRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const hasRefreshToken = request.cookies.has('refreshToken');

    if (pathname === '/') {
        return NextResponse.redirect(new URL(hasRefreshToken ? '/dashboard' : '/login', request.url));
    }

    const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublic = publicRoutes.some(route => pathname.startsWith(route));

    if (isProtected && !hasRefreshToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isPublic && hasRefreshToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/dashboard/:path*', '/results/:path*', '/tests/:path*', '/login', '/register'],
};
