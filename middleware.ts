import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting store
// Note: In production with multiple server instances, use Redis (e.g., Upstash) instead.
const rateLimit = new Map();

const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute per IP

export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    
    // Skip rate limiting if IP is unknown (can happen in some environments)
    if (ip !== 'unknown') {
      const now = Date.now();
      const windowStart = now - WINDOW_SIZE_IN_SECONDS * 1000;
      
      let ipData = rateLimit.get(ip) || { count: 0, resetTime: now + WINDOW_SIZE_IN_SECONDS * 1000 };
      
      // If the current time is past the reset time, reset the count
      if (now > ipData.resetTime) {
        ipData = { count: 1, resetTime: now + WINDOW_SIZE_IN_SECONDS * 1000 };
      } else {
        ipData.count += 1;
      }
      
      rateLimit.set(ip, ipData);
      
      // Keep map size manageable by removing expired entries
      if (rateLimit.size > 10000) {
        rateLimit.forEach((value, key) => {
          if (now > value.resetTime) {
            rateLimit.delete(key);
          }
        });
      }
      
      if (ipData.count > MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
  ],
};
