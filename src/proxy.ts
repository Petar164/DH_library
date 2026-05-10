import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isPendingRoute = pathname === '/pending'
  const isAdminRoute = pathname.startsWith('/admin')
  const isApiRoute = pathname.startsWith('/api')

  if (isApiRoute) return supabaseResponse

  if (!user) {
    if (!isAuthRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL('/library', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  if (!role || role === 'pending') {
    if (!isPendingRoute) {
      return NextResponse.redirect(new URL('/pending', request.url))
    }
    return supabaseResponse
  }

  if (isPendingRoute) {
    return NextResponse.redirect(new URL('/library', request.url))
  }

  if (isAdminRoute && role !== 'admin') {
    return NextResponse.redirect(new URL('/library', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
