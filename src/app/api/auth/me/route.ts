import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

export async function GET() {
  await ensureDbInitialized();

  try {
    const session = await getSession();
    if (!session) {
      return errorResponse('Not authenticated', 401);
    }

    const db = getDb();
    const { data: user, error: userError } = await db
      .from('users')
      .select('id, full_name, email, phone, role')
      .eq('id', session.userId)
      .eq('is_active', true)
      .maybeSingle();

    if (userError || !user) {
      return errorResponse('User not found', 401);
    }

    return successResponse(user);
  } catch (error) {
    console.error('Session check error:', error);
    return errorResponse('Session check failed', 500);
  }
}
