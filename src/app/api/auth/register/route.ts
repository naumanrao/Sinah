import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { hashPassword, createToken, setSessionCookie } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse, checkRateLimit } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  await ensureDbInitialized();

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`register:${ip}`, 5, 300000)) {
    return errorResponse('Too many registration attempts. Please try again later.', 429);
  }

  try {
    const body = await request.json();
    const { full_name, email, phone, password } = body;

    // Validation
    if (!full_name || !email || !password) {
      return errorResponse('Full name, email, and password are required');
    }
    if (full_name.length < 2) return errorResponse('Full name must be at least 2 characters');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errorResponse('Invalid email address');
    if (password.length < 6) return errorResponse('Password must be at least 6 characters');
    if (phone && !/^[\d\s+\-()]{7,20}$/.test(phone)) return errorResponse('Invalid phone number');

    const db = getDb();
    const cleanEmail = email.toLowerCase().trim();

    // Check for duplicate email
    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existing) {
      return errorResponse('An account with this email already exists');
    }

    const userId = uuidv4();
    const passwordHash = await hashPassword(password);

    const { error: insertError } = await db.from('users').insert({
      id: userId,
      full_name: full_name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || null,
      password_hash: passwordHash,
      role: 'student',
    });

    if (insertError) {
      console.error('Registration insert error:', insertError);
      return errorResponse('Registration failed. Please try again.', 500);
    }

    const token = await createToken({ userId, email: cleanEmail, role: 'student' });
    await setSessionCookie(token);

    return successResponse({
      user: { id: userId, full_name: full_name.trim(), email: cleanEmail, phone: phone?.trim() || '', role: 'student' }
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Registration failed. Please try again.', 500);
  }
}
