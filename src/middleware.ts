import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isOnboarding = request.nextUrl.pathname.startsWith('/onboarding')
  const isApi = request.nextUrl.pathname.startsWith('/api')
  
  if (isApi) return NextResponse.next()

  const hasOnboarded = request.cookies.has('pantheon_onboarded')

  if (!hasOnboarded && !isOnboarding) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  if (hasOnboarded && isOnboarding) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
