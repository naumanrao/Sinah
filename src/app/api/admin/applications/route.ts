import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { getSession, requireRole } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/admin/applications - List all applications with filtering
export async function GET(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin', 'admission_manager', 'admission_officer', 'finance_officer', 'readonly_staff'])) {
      return errorResponse('Unauthorized', 403);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const program = searchParams.get('program') || '';
    const sessionFilter = searchParams.get('session') || '';

    const db = getDb();

    let query = db
      .from('applications')
      .select(`
        id, reference_number, full_name, email, phone, cnic, status, submitted_at, created_at,
        assigned_reviewer,
        program:programs(name),
        session:admission_sessions(title),
        reviewer:users!applications_assigned_reviewer_fkey(full_name)
      `, { count: 'exact' })
      .eq('is_draft', false);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,reference_number.ilike.%${search}%,email.ilike.%${search}%,cnic.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (program) {
      query = query.eq('program_id', program);
    }
    if (sessionFilter) {
      query = query.eq('session_id', sessionFilter);
    }

    const { data: rawApps, count, error: qErr } = await query
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (qErr) {
      console.error('Error querying admin applications:', qErr);
      return errorResponse('Failed to fetch applications', 500);
    }

    const applications = (rawApps || []).map((a: any) => ({
      id: a.id,
      reference_number: a.reference_number,
      full_name: a.full_name,
      email: a.email,
      phone: a.phone,
      cnic: a.cnic,
      status: a.status,
      submitted_at: a.submitted_at,
      created_at: a.created_at,
      assigned_reviewer: a.assigned_reviewer,
      program_name: a.program?.name,
      session_title: a.session?.title,
      reviewer_name: a.reviewer?.full_name,
    }));

    const totalCount = count || 0;

    return successResponse({
      applications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Admin applications error:', error);
    return errorResponse('Failed to fetch applications', 500);
  }
}

// PUT /api/admin/applications - Update application status
export async function PUT(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin', 'admission_manager', 'admission_officer'])) {
      return errorResponse('Unauthorized', 403);
    }

    const body = await request.json();
    const { application_id, status, note, internal_note, assigned_reviewer, student_message } = body;

    if (!application_id) return errorResponse('Application ID is required');

    const db = getDb();
    const { data: app, error: findErr } = await db
      .from('applications')
      .select('id, status, user_id')
      .eq('id', application_id)
      .maybeSingle();

    if (findErr || !app) return errorResponse('Application not found', 404);

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status && status !== app.status) {
      updates.status = status;

      // Record history
      await db.from('application_status_history').insert({
        id: uuidv4(),
        application_id,
        from_status: app.status,
        to_status: status,
        changed_by: session!.userId,
        note: note || null,
        internal_note: internal_note || null,
      });

      // Notify student
      const { data: statusLabel } = await db
        .from('application_statuses')
        .select('label')
        .eq('name', status)
        .maybeSingle();

      await db.from('notifications').insert({
        id: uuidv4(),
        user_id: app.user_id,
        title: 'Application Status Updated',
        message: `Your application status has been updated to: ${statusLabel?.label || status}${note ? `. Note: ${note}` : ''}`,
        type: 'info',
        link: '/dashboard',
      });
    }

    if (assigned_reviewer !== undefined) {
      updates.assigned_reviewer = assigned_reviewer || null;
    }

    if (student_message !== undefined) {
      updates.student_message = student_message || null;
    }

    const { error: updateErr } = await db
      .from('applications')
      .update(updates)
      .eq('id', application_id);

    if (updateErr) {
      console.error('Application update error:', updateErr);
      return errorResponse('Failed to update application', 500);
    }

    // Add internal note if provided without status change
    if (internal_note && (!status || status === app.status)) {
      await db.from('reviewer_notes').insert({
        id: uuidv4(),
        application_id,
        author_id: session!.userId,
        note: internal_note,
        is_internal: true,
      });
    }

    // Log audit
    await db.from('audit_log').insert({
      id: uuidv4(),
      user_id: session!.userId,
      action: 'update_application',
      entity_type: 'application',
      entity_id: application_id,
      details: JSON.stringify({ status, note, internal_note }),
    });

    return successResponse({ message: 'Application updated' });
  } catch (error) {
    console.error('Admin application update error:', error);
    return errorResponse('Failed to update application', 500);
  }
}
