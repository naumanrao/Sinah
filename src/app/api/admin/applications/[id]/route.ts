import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession, requireRole } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/admin/applications/[id] - Get full application detail for admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin', 'admission_manager', 'admission_officer', 'finance_officer', 'readonly_staff'])) {
      return errorResponse('Unauthorized', 403);
    }

    const { id } = await params;
    const db = getDb();

    const { data: app, error: appError } = await db
      .from('applications')
      .select(`
        *,
        program:programs(name, slug, eligibility),
        session:admission_sessions(title, academic_year),
        user:users!applications_user_id_fkey(full_name, email),
        reviewer:users!applications_assigned_reviewer_fkey(full_name)
      `)
      .eq('id', id)
      .maybeSingle();

    if (appError || !app) return errorResponse('Application not found', 404);

    // Qualifications
    const { data: qualifications } = await db
      .from('academic_qualifications')
      .select('*')
      .eq('application_id', id)
      .order('sort_order', { ascending: true });

    // Documents
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

    // Required documents
    const { data: requiredDocs } = await db
      .from('program_documents')
      .select('*')
      .eq('program_id', app.program_id)
      .order('sort_order', { ascending: true });

    // Status history
    const { data: statusHistory } = await db
      .from('application_status_history')
      .select('*, changed_by_user:users!application_status_history_changed_by_fkey(full_name)')
      .eq('application_id', id)
      .order('created_at', { ascending: false });

    const { data: allStatuses } = await db
      .from('application_statuses')
      .select('name, label');

    const statusMap = new Map((allStatuses || []).map((s: any) => [s.name, s.label]));

    const mappedHistory = (statusHistory || []).map((h: any) => ({
      ...h,
      changed_by_name: h.changed_by_user?.full_name,
      from_label: statusMap.get(h.from_status) || h.from_status,
      to_label: statusMap.get(h.to_status) || h.to_status,
    }));

    // Reviewer notes
    const { data: reviewerNotes } = await db
      .from('reviewer_notes')
      .select('*, author:users!reviewer_notes_author_id_fkey(full_name)')
      .eq('application_id', id)
      .order('created_at', { ascending: false });

    const mappedNotes = (reviewerNotes || []).map((rn: any) => ({
      ...rn,
      author_name: rn.author?.full_name,
    }));

    // Merit scores
    const { data: meritScores } = await db
      .from('merit_scores')
      .select('*, criteria:merit_criteria(criteria_name, criteria_type, weight_percentage, max_score)')
      .eq('application_id', id);

    const mappedScores = (meritScores || []).map((ms: any) => ({
      ...ms,
      criteria_name: ms.criteria?.criteria_name,
      criteria_type: ms.criteria?.criteria_type,
      weight_percentage: ms.criteria?.weight_percentage,
      max_score: ms.criteria?.max_score,
    }));

    // Fee invoices
    const { data: feeInvoices } = await db
      .from('fee_invoices')
      .select('*')
      .eq('application_id', id)
      .order('created_at', { ascending: false });

    return successResponse({
      ...app,
      program_name: app.program?.name,
      program_slug: app.program?.slug,
      program_eligibility: app.program?.eligibility,
      session_title: app.session?.title,
      academic_year: app.session?.academic_year,
      applicant_user_name: app.user?.full_name,
      user_email: app.user?.email,
      reviewer_name: app.reviewer?.full_name,
      qualifications: qualifications || [],
      documents: mappedDocs,
      required_documents: requiredDocs || [],
      status_history: mappedHistory,
      reviewer_notes: mappedNotes,
      merit_scores: mappedScores,
      fee_invoices: feeInvoices || [],
    });
  } catch (error) {
    console.error('Admin application detail error:', error);
    return errorResponse('Failed to fetch application', 500);
  }
}
