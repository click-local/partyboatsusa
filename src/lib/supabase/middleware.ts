import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Skip middleware if env vars are missing
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh session if expired
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
      const role = user.user_metadata?.role;
      if (role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
    }

    // Protect operator routes
    if (request.nextUrl.pathname.startsWith("/operator") &&
        !request.nextUrl.pathname.startsWith("/operator/login") &&
        !request.nextUrl.pathname.startsWith("/operator/forgot-password") &&
        !request.nextUrl.pathname.startsWith("/operator/reset-password") &&
        !request.nextUrl.pathname.startsWith("/operator/verify-email") &&
        !request.nextUrl.pathname.startsWith("/operator/claim")) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/operator/login";
        return NextResponse.redirect(url);
      }
      const role = user.user_metadata?.role;
      if (role !== "operator") {
        const url = request.nextUrl.clone();
        url.pathname = "/operator/login";
        return NextResponse.redirect(url);
      }
    }
  } catch {
    // If auth check fails, redirect protected pages to login
    const path = request.nextUrl.pathname;
    if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    if (path.startsWith("/operator") &&
        !path.startsWith("/operator/login") &&
        !path.startsWith("/operator/forgot-password") &&
        !path.startsWith("/operator/reset-password") &&
        !path.startsWith("/operator/verify-email") &&
        !path.startsWith("/operator/claim")) {
      const url = request.nextUrl.clone();
      url.pathname = "/operator/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
