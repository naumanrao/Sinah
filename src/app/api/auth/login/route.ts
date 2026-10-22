import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, createToken, setSessionCookie } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse, checkRateLimit } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  await ensureDbInitialized();

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`login:${ip}`, 10, 300000)) {
    return errorResponse('Too many login attempts. Please try again later.', 429);
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    const db = getDb();
    const cleanEmail = email.toLowerCase().trim();

    const { data: user, error: userError } = await db
      .from('users')
      .select('id, full_name, email, phone, password_hash, role, is_active')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (userError) {
      console.error('Login query error:', userError);
      return errorResponse('Login failed. Please try again.', 500);
    }

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    if (!user.is_active) {
      return errorResponse('Your account has been deactivated. Contact administration.', 403);
    }

    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return errorResponse('Invalid email or password', 401);
    }

    const token = await createToken({ userId: user.id, email: user.email, role: user.role });
    await setSessionCookie(token);

    return successResponse({
      user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone || '', role: user.role }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
    console.error('Login error:', error);
    return errorResponse(message, 500);
  }
}
