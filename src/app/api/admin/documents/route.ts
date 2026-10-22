import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { getSession, requireRole } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// PUT /api/admin/documents - Verify/reject a document
export async function PUT(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin', 'admission_manager', 'admission_officer'])) {
      return errorResponse('Unauthorized', 403);
    }

    const body = await request.json();
    const { document_id, verification_status, rejection_reason } = body;

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
