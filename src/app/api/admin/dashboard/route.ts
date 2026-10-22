import { getDb } from '@/lib/db';
import { getSession, requireRole } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/admin/dashboard - Dashboard statistics
export async function GET() {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin', 'admission_manager', 'admission_officer', 'finance_officer', 'readonly_staff'])) {
      return errorResponse('Unauthorized', 403);
    }

    const db = getDb();

    // Fetch submitted applications with program & session relations
    const { data: submittedApps, error: appsError } = await db
      .from('applications')
      .select('id, reference_number, full_name, status, submitted_at, program_id, session_id, program:programs(id, name, category), session:admission_sessions(id, title)')
      .eq('is_draft', false)
      .order('submitted_at', { ascending: false });

    if (appsError) {
      console.error('Error fetching dashboard applications:', appsError);
      return errorResponse('Failed to fetch dashboard data', 500);
    }

    const { count: draftCount } = await db
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('is_draft', true);

    const { count: totalStudents } = await db
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'student');

    const { data: statuses } = await db
      .from('application_statuses')
      .select('name, label, color')
      .order('sort_order', { ascending: true });

    const { data: activeSession } = await db
      .from('admission_sessions')
      .select('id, title, academic_year, status')
      .eq('status', 'open')
      .limit(1)
      .maybeSingle();

    // Status counts
    const statusCountMap = new Map<string, number>();
    for (const app of (submittedApps || [])) {
      const s = app.status || 'submitted';
      statusCountMap.set(s, (statusCountMap.get(s) || 0) + 1);
    }

    const statusMap = new Map((statuses || []).map((s: any) => [s.name, s]));
    const formattedByStatus = Array.from(statusCountMap.entries()).map(([status, count]) => {
      const info = statusMap.get(status);
      return {
        status,
        label: info?.label || status,
        color: info?.color || '#3b82f6',
        count,
      };
    });

    // By Program
    const progCountMap = new Map<string, { id: string; name: string; category: string; count: number }>();
    for (const app of (submittedApps || [])) {
      const p = (app as any).program;
      if (p && p.id) {
        const existing = progCountMap.get(p.id) || { id: p.id, name: p.name, category: p.category, count: 0 };
        existing.count++;
        progCountMap.set(p.id, existing);
      }
    }
    const byProgram = Array.from(progCountMap.values()).sort((a, b) => b.count - a.count);

    // By Session
    const sessCountMap = new Map<string, { id: string; title: string; count: number }>();
    for (const app of (submittedApps || [])) {
      const s = (app as any).session;
      if (s && s.id) {
        const existing = sessCountMap.get(s.id) || { id: s.id, title: s.title, count: 0 };
        existing.count++;
        sessCountMap.set(s.id, existing);
      }
    }
    const bySession = Array.from(sessCountMap.values()).sort((a, b) => b.count - a.count);

    // Recent applications
    const recentApplications = (submittedApps || []).slice(0, 10).map((a: any) => ({
      id: a.id,
      reference_number: a.reference_number,
      full_name: a.full_name,
      status: a.status,
      submitted_at: a.submitted_at,
      program_name: a.program?.name,
    }));

    const totalSubmittedCount = submittedApps?.length || 0;
    const totalDraftsCount = draftCount || 0;

    return successResponse({
      totalApplications: totalSubmittedCount + totalDraftsCount,
      totalSubmitted: totalSubmittedCount,
      totalDrafts: totalDraftsCount,
      totalStudents: totalStudents || 0,
      byStatus: formattedByStatus,
      byProgram,
      bySession,
      recentApplications,
      activeSession: activeSession || null,
      statuses: statuses || [],
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse('Failed to fetch dashboard', 500);
  }
}
