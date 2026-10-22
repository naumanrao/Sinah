import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { getSession, requireRole } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/admin/documents - List documents in the verification queue
export async function GET(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin', 'admission_manager', 'admission_officer', 'finance_officer', 'readonly_staff'])) {
      return errorResponse('Unauthorized', 403);
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || '';

    const db = getDb();
    let query = db
      .from('uploaded_documents')
      .select(`
        id,
        application_id,
        document_name,
        original_filename,
        stored_filename,
        verification_status,
        rejection_reason,
        uploaded_at,
        application:applications!inner(
          reference_number,
          full_name,
          program:programs(name)
        )
      `)
      .order('uploaded_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('verification_status', statusFilter);
    }

    const { data: rawDocs, error } = await query;

    if (error) {
      console.error('Admin documents fetch error:', error);
      return errorResponse('Failed to fetch documents queue', 500);
    }

    const documents = (rawDocs || []).map((d: any) => ({
      id: d.id,
      application_id: d.application_id,
      reference_number: d.application?.reference_number,
      student_name: d.application?.full_name,
      program_name: d.application?.program?.name,
      document_name: d.document_name,
      original_filename: d.original_filename,
      stored_filename: d.stored_filename,
      verification_status: d.verification_status,
      rejection_reason: d.rejection_reason,
      uploaded_at: d.uploaded_at,
    }));

    return successResponse(documents);
  } catch (error) {
    console.error('Admin documents queue error:', error);
    return errorResponse('Failed to fetch documents queue', 500);
  }
}

// Internal verification handler supporting both POST and PUT methods
async function handleDocumentVerification(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin', 'admission_manager', 'admission_officer'])) {
      return errorResponse('Unauthorized', 403);
    }

    const body = await request.json();
    const document_id = body.document_id || body.id;
    const verification_status = body.verification_status || body.status;
    const rejection_reason = body.rejection_reason || body.reason;

    if (!document_id || !verification_status) {
      return errorResponse('Document ID and verification status are required');
    }

    if (verification_status === 'rejected' && !rejection_reason) {
      return errorResponse('Rejection reason is required');
    }

    if (verification_status === 'replacement_required' && !rejection_reason) {
      return errorResponse('Reason for replacement request is required');
    }

    const db = getDb();

    const { error: updateErr } = await db
      .from('uploaded_documents')
      .update({
        verification_status,
        rejection_reason: rejection_reason || null,
        verified_by: session!.userId,
        verified_at: new Date().toISOString(),
      })
      .eq('id', document_id);

    if (updateErr) {
      console.error('Error updating document status:', updateErr);
      return errorResponse('Failed to update document', 500);
    }

    // If replacement required or rejected, notify student
    if (verification_status === 'replacement_required' || verification_status === 'rejected') {
      const { data: doc } = await db
        .from('uploaded_documents')
        .select('document_name, application:applications!inner(user_id, reference_number)')
        .eq('id', document_id)
        .maybeSingle();

      if (doc) {
        const app = doc.application as unknown as { user_id: string; reference_number: string } | null;
        if (app) {
          await db.from('notifications').insert({
            id: uuidv4(),
            user_id: app.user_id,
            title: 'Document Action Required',
            message: `Your document "${doc.document_name}" for application ${app.reference_number} has been ${verification_status === 'rejected' ? 'rejected' : 'flagged for replacement'}. Reason: ${rejection_reason}`,
            type: 'warning',
            link: '/dashboard',
          });
        }
      }
    }

    return successResponse({ message: 'Document status updated' });
  } catch (error) {
    console.error('Document verification error:', error);
    return errorResponse('Failed to update document', 500);
  }
}

// POST /api/admin/documents - Verify/reject a document (matches frontend call)
export async function POST(request: NextRequest) {
  return handleDocumentVerification(request);
}

// PUT /api/admin/documents - Verify/reject a document (standard REST)
export async function PUT(request: NextRequest) {
  return handleDocumentVerification(request);
}
