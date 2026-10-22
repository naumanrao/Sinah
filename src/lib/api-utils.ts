import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/schema';

// Initialize database on first API call
let initialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureDbInitialized() {
  if (initialized) return;
  if (!initPromise) {
    initPromise = initializeDatabase()
      .then(() => {
        initialized = true;
      })
      .catch((err) => {
        initPromise = null; // Allow retry on failure
        console.error('Database initialization failed:', err);
        throw err;
      });
  }
  return initPromise;
}

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// Rate limiting map (in-memory, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}
