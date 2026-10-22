import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/applications/[id] - Get a specific application (for the student)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!session) return errorResponse('Not authenticated', 401);

    const { id } = await params;
    const db = getDb();

    const { data: app, error: appError } = await db
      .from('applications')
      .select(`
        *,
        program:programs(name, slug, eligibility),
        session:admission_sessions(title, academic_year)
      `)
      .eq('id', id)
      .eq('user_id', session.userId)
      .maybeSingle();

    if (appError || !app) {
      return errorResponse('Application not found', 404);
    }

    // Get qualifications
    const { data: qualifications } = await db
      .from('academic_qualifications')
      .select('*')
      .eq('application_id', id)
      .order('sort_order', { ascending: true });

    // Get uploaded documents
    const { data: documents } = await db
      .from('uploaded_documents')
      .select(`
        *,
        program_document:program_documents(document_name, is_required)
      `)
      .eq('application_id', id)
      .order('uploaded_at', { ascending: true });

    const mappedDocs = (documents || []).map((d: any) => ({
      ...d,
      required_name: d.program_document?.document_name,
      is_required: d.program_document?.is_required,
    }));

    // Get required documents for this program
    const { data: requiredDocs } = await db
      .from('program_documents')
      .select('*')
      .eq('program_id', app.program_id)
      .order('sort_order', { ascending: true });

    // Get status history (only student-visible info)
    const { data: statusHistory } = await db
      .from('application_status_history')
      .select('id, from_status, to_status, note, created_at, internal_note')
      .eq('application_id', id)
      .is('internal_note', null)
      .order('created_at', { ascending: false });

    const { data: allStatuses } = await db
      .from('application_statuses')
      .select('name, label');

    const statusMap = new Map((allStatuses || []).map((s: any) => [s.name, s.label]));

    const mappedHistory = (statusHistory || []).map((h: any) => ({
      id: h.id,
      from_status: h.from_status,
      to_status: h.to_status,
      note: h.note,
      created_at: h.created_at,
      from_label: statusMap.get(h.from_status) || h.from_status,
      to_label: statusMap.get(h.to_status) || h.to_status,
    }));

    // Get notifications for this user related to this application
    const { data: notifications } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', session.userId)
      .like('link', `%${id}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    return successResponse({
      ...app,
      program_name: app.program?.name,
      program_slug: app.program?.slug,
      program_eligibility: app.program?.eligibility,
      session_title: app.session?.title,
      academic_year: app.session?.academic_year,
      qualifications: qualifications || [],
      documents: mappedDocs,
      required_documents: requiredDocs || [],
      status_history: mappedHistory,
      notifications: notifications || [],
    });
  } catch (error) {
    console.error('Application detail error:', error);
    return errorResponse('Failed to fetch application', 500);
  }
}
