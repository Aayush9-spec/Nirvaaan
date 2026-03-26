import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Skip auth check for public pages
    const pathname = request.nextUrl.pathname
    const isPublicRoute =
        pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/forgot-password') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.includes('.')

    if (isPublicRoute) {
        return supabaseResponse
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Not logged in → redirect to login
    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Role-based routing
    const role = user.user_metadata?.role || 'patient'
    const isDoctorRoute = pathname.startsWith('/doctor')
    const isDashboardRoute = pathname.startsWith('/dashboard')
    const isAdminRoute = pathname.startsWith('/admin')

    // Patients cannot access doctor routes
    if (isDoctorRoute && role !== 'doctor') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // Doctors cannot access patient dashboard  
    if (isDashboardRoute && role === 'doctor') {
        const url = request.nextUrl.clone()
        url.pathname = '/doctor'
        return NextResponse.redirect(url)
    }

    // Only admins can access admin routes
    if (isAdminRoute && role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = role === 'doctor' ? '/doctor' : '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
