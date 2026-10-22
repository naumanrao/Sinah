import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { getSession, requireRole, hashPassword } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/admin/users - List users
export async function GET(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin'])) {
      return errorResponse('Unauthorized', 403);
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || '';

    const db = getDb();
    let query = db
      .from('users')
      .select('id, full_name, email, phone, role, is_active, created_at')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error: uErr } = await query;

    if (uErr) {
      console.error('Users query error:', uErr);
      return errorResponse('Failed to fetch users', 500);
    }

    return successResponse(users || []);
  } catch (error) {
    console.error('Users fetch error:', error);
    return errorResponse('Failed to fetch users', 500);
  }
}

// POST /api/admin/users - Create staff user
export async function POST(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin'])) {
      return errorResponse('Unauthorized', 403);
    }

    const body = await request.json();
    const { full_name, email, phone, password, role } = body;

    if (!full_name || !email || !password || !role) {
      return errorResponse('All fields are required');
    }

    const validRoles = ['super_admin', 'admission_manager', 'admission_officer', 'finance_officer', 'readonly_staff'];
    if (!validRoles.includes(role)) {
      return errorResponse('Invalid role');
    }

    const db = getDb();
    const cleanEmail = email.toLowerCase().trim();

    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existing) return errorResponse('Email already exists');

    const id = uuidv4();
    const passwordHash = await hashPassword(password);

    const { error: insertErr } = await db.from('users').insert({
      id,
      full_name: full_name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || null,
      password_hash: passwordHash,
      role,
      is_active: true,
      email_verified: true,
    });

    if (insertErr) {
      console.error('User creation insert error:', insertErr);
      return errorResponse('Failed to create user', 500);
    }

    return successResponse({ id }, 201);
  } catch (error) {
    console.error('User creation error:', error);
    return errorResponse('Failed to create user', 500);
  }
}

// PUT /api/admin/users - Update user
export async function PUT(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin'])) {
      return errorResponse('Unauthorized', 403);
    }

    const body = await request.json();
    const { id, role, is_active } = body;

    if (!id) return errorResponse('User ID is required');

    const db = getDb();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    const { error: updateErr } = await db
      .from('users')
      .update(updates)
      .eq('id', id);

    if (updateErr) {
      console.error('User update error:', updateErr);
      return errorResponse('Failed to update user', 500);
    }

    return successResponse({ message: 'User updated' });
  } catch (error) {
    console.error('User update error:', error);
    return errorResponse('Failed to update user', 500);
  }
}
