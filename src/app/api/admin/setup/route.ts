import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// POST /api/admin/setup - Create initial super admin (only works if no admin exists)
export async function POST() {
  await ensureDbInitialized();
  try {
    const db = getDb();

    // Check if any admin exists
    const { data: existingAdmin } = await db
      .from('users')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1)
      .maybeSingle();

    if (existingAdmin) {
      return errorResponse('A super admin already exists. Use the admin panel to create more admins.', 403);
    }

    const id = uuidv4();
    const passwordHash = await hashPassword('Admin@12345');

    const { error: insertError } = await db.from('users').insert({
      id,
      full_name: 'System Administrator',
      email: 'admin@sinah.edu.pk',
      phone: '+92 307 1669696',
      password_hash: passwordHash,
      role: 'super_admin',
      is_active: true,
      email_verified: true,
    });

    if (insertError) {
      console.error('Admin setup insert error:', insertError);
      return errorResponse('Failed to create super admin', 500);
    }

    return successResponse({
      message: 'Super admin created successfully',
      email: 'admin@sinah.edu.pk',
      password: 'Admin@12345',
      warning: 'CHANGE THIS PASSWORD IMMEDIATELY after first login!'
    }, 201);
  } catch (error) {
    console.error('Setup error:', error);
    return errorResponse('Setup failed', 500);
  }
}
