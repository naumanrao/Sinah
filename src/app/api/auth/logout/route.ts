import { clearSessionCookie } from '@/lib/auth';
import { successResponse } from '@/lib/api-utils';

export async function POST() {
  await clearSessionCookie();
  return successResponse({ message: 'Logged out successfully' });
}
