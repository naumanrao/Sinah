import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/notifications - Get user's notifications
export async function GET() {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!session) return errorResponse('Not authenticated', 401);

    const db = getDb();
    const { data: notifications, error: notifError } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (notifError) {
      console.error('Notifications query error:', notifError);
      return errorResponse('Failed to fetch notifications', 500);
    }

    const { count: unreadCount } = await db
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.userId)
      .eq('is_read', false);

    return successResponse({
      notifications: notifications || [],
      unread_count: unreadCount || 0,
    });
  } catch (error) {
    console.error('Notifications error:', error);
    return errorResponse('Failed to fetch notifications', 500);
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!session) return errorResponse('Not authenticated', 401);

    const body = await request.json();
    const { notification_id, mark_all } = body;

    const db = getDb();

    if (mark_all) {
      const { error } = await db
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.userId);

      if (error) throw error;
    } else if (notification_id) {
      const { error } = await db
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification_id)
        .eq('user_id', session.userId);

      if (error) throw error;
    }

    return successResponse({ message: 'Notifications updated' });
  } catch (error) {
    console.error('Notifications update error:', error);
    return errorResponse('Failed to update notifications', 500);
  }
}
