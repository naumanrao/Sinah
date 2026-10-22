import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// POST /api/applications/submit - Submit a draft application
export async function POST(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!session) return errorResponse('Not authenticated', 401);

    const body = await request.json();
    const { application_id, declaration_accepted } = body;

    if (!application_id) return errorResponse('Application ID is required');

    const db = getDb();

    // Get the application
    const { data: app, error: appError } = await db
      .from('applications')
      .select('*')
      .eq('id', application_id)
      .eq('user_id', session.userId)
      .maybeSingle();

    if (appError || !app) return errorResponse('Application not found', 404);
    if (!app.is_draft) return errorResponse('This application has already been submitted');

    // Validate required personal/contact fields
    const requiredFields = ['full_name', 'father_name', 'date_of_birth', 'cnic', 'email', 'phone', 'current_address'];
    const missing = requiredFields.filter((f) => !app[f]);
    if (missing.length > 0) {
      return errorResponse(`Missing required fields: ${missing.join(', ')}`);
    }

    // Accept declaration if checked in payload or previously stored
    const isDeclarationAccepted = declaration_accepted !== undefined
      ? Boolean(declaration_accepted)
      : Boolean(app.declaration_accepted);

    if (!isDeclarationAccepted) {
      return errorResponse('You must accept the declaration before submitting');
    }

    // Check qualifications
    const { count: qualsCount } = await db
      .from('academic_qualifications')
      .select('id', { count: 'exact', head: true })
      .eq('application_id', application_id);

    if (!qualsCount || qualsCount === 0) {
      return errorResponse('At least one academic qualification is required');
    }

    // Check required documents by program_document_id OR document_name
    const { data: requiredDocs } = await db
      .from('program_documents')
      .select('id, document_name')
      .eq('program_id', app.program_id)
      .eq('is_required', true);

    const { data: uploadedDocs } = await db
      .from('uploaded_documents')
      .select('program_document_id, document_name')
      .eq('application_id', application_id);

    const uploadedIdSet = new Set((uploadedDocs || []).map((d: any) => d.program_document_id).filter(Boolean));
    const uploadedNameSet = new Set((uploadedDocs || []).map((d: any) => d.document_name?.trim().toLowerCase()).filter(Boolean));

    for (const doc of (requiredDocs || [])) {
      const matchById = uploadedIdSet.has(doc.id);
      const matchByName = uploadedNameSet.has(doc.document_name?.trim().toLowerCase());
      if (!matchById && !matchByName) {
        return errorResponse(`Required document missing: ${doc.document_name}`);
      }
    }

    const now = new Date().toISOString();

    // Update application to submitted
    const { error: updateError } = await db
      .from('applications')
      .update({
        is_draft: false,
        status: 'submitted',
        declaration_accepted: true,
        submitted_at: now,
        updated_at: now,
      })
      .eq('id', application_id);

    if (updateError) {
      console.error('Error submitting application:', updateError);
      return errorResponse('Failed to submit application', 500);
    }

    // Record status history
    await db.from('application_status_history').insert({
      id: uuidv4(),
      application_id,
      from_status: 'draft',
      to_status: 'submitted',
      changed_by: session.userId,
      note: 'Application submitted by student',
    });

    // Create notification
    await db.from('notifications').insert({
      id: uuidv4(),
      user_id: session.userId,
      title: 'Application Submitted',
      message: `Your application ${app.reference_number} has been submitted successfully.`,
      type: 'success',
      link: '/dashboard',
    });

    return successResponse({
      message: 'Application submitted successfully',
      reference_number: app.reference_number,
    });
  } catch (error) {
    console.error('Application submit error:', error);
    return errorResponse('Failed to submit application', 500);
  }
}
