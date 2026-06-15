import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isOnboarding = pathname.startsWith('/onboarding')
  const isApi = pathname.startsWith('/api')
  const isPublicAsset = /\.[a-zA-Z0-9]+$/.test(pathname)
  
  if (isApi || isPublicAsset) return NextResponse.next()

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
