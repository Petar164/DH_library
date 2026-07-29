import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PREFIXES = ['/library', '/infopoint', '/profile']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password')
  const isAdminRoute = pathname.startsWith('/admin')
  const isUploadRoute = pathname.startsWith('/upload')
  const isApiRoute = pathname.startsWith('/api')

  // Anyone, signed in or not, can browse these.
  const isPublicRoute =
    pathname === '/' ||
    PUBLIC_PREFIXES.some(p => pathname === p || pathname.startsWith(`${p}/`))

  if (isApiRoute) return supabaseResponse

  // Password recovery has to work both signed out and while holding the
  // short-lived recovery session, so it sits outside the rules below.
  if (pathname.startsWith('/auth/') || pathname === '/reset-password') {
    return supabaseResponse
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (isAuthRoute) {
    if (user) return NextResponse.redirect(new URL('/library', request.url))
    return supabaseResponse
  }

  // Approval was removed; the holding page it pointed at is no longer used.
  if (pathname === '/pending') {
    return NextResponse.redirect(new URL('/library', request.url))
  }

  if (isPublicRoute) return supabaseResponse

  // Everything past this point is contribution or moderation — sign-in required.
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  if (isAdminRoute && role !== 'admin') {
    return NextResponse.redirect(new URL('/library', request.url))
  }

  if (isUploadRoute && role !== 'contributor' && role !== 'admin') {
    return NextResponse.redirect(new URL('/library', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
