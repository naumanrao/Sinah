import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { generateReferenceNumber } from '@/lib/schema';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/applications - Get current user's applications
export async function GET() {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!session) return errorResponse('Not authenticated', 401);

    const db = getDb();
    const { data: applications, error: appErr } = await db
      .from('applications')
      .select(`
        *,
        program:programs(name, slug),
        session:admission_sessions(title)
      `)
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false });

    if (appErr) {
      console.error('Applications query error:', appErr);
      return errorResponse('Failed to fetch applications', 500);
    }

    const flat = (applications || []).map((a: any) => ({
      ...a,
      program_name: a.program?.name,
      program_slug: a.program?.slug,
      session_title: a.session?.title,
    }));

    return successResponse(flat);
  } catch (error) {
    console.error('Applications fetch error:', error);
    return errorResponse('Failed to fetch applications', 500);
  }
}

// POST /api/applications - Create or save draft application
export async function POST(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!session) return errorResponse('Not authenticated', 401);

    const body = await request.json();
    const { session_id, program_id, ...formData } = body;

    if (!session_id || !program_id) {
      return errorResponse('Session and program are required');
    }

    const db = getDb();

    // Validate session is open
    const { data: admSession } = await db
      .from('admission_sessions')
      .select('id, status, start_date, end_date')
      .eq('id', session_id)
      .eq('status', 'open')
      .maybeSingle();

    if (!admSession) {
      return errorResponse('This admission session is not currently accepting applications');
    }

    // Validate program is in session
    const { data: sp } = await db
      .from('session_programs')
      .select('id')
      .eq('session_id', session_id)
      .eq('program_id', program_id)
      .eq('is_active', true)
      .maybeSingle();

    if (!sp) {
      return errorResponse('This program is not available in the selected session');
    }

    // Check for existing application (draft or submitted)
    const { data: existing } = await db
      .from('applications')
      .select('id, is_draft, status, reference_number')
      .eq('user_id', session.userId)
      .eq('session_id', session_id)
      .eq('program_id', program_id)
      .maybeSingle();

    if (existing && !existing.is_draft) {
      return errorResponse('You have already submitted an application for this program in this session');
    }

    const appId = existing?.id || uuidv4();
    const refNum = existing ? existing.reference_number : await generateReferenceNumber();

    if (existing) {
      // Update existing draft
      const { error: updateError } = await db.from('applications').update({
        full_name: formData.full_name || null,
        father_name: formData.father_name || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        cnic: formData.cnic || null,
        nationality: formData.nationality || 'Pakistani',
        domicile: formData.domicile || null,
        email: formData.email || null,
        phone: formData.phone || null,
        alternate_phone: formData.alternate_phone || null,
        current_address: formData.current_address || null,
        permanent_address: formData.permanent_address || null,
        current_step: formData.current_step || 1,
        declaration_accepted: Boolean(formData.declaration_accepted),
        student_message: formData.student_message || null,
        updated_at: new Date().toISOString(),
      }).eq('id', appId);

      if (updateError) {
        console.error('Application update error:', updateError);
        return errorResponse('Failed to update application', 500);
      }
    } else {
      // Create new draft
      const { error: insertError } = await db.from('applications').insert({
        id: appId,
        reference_number: refNum,
        user_id: session.userId,
        session_id,
        program_id,
        full_name: formData.full_name || null,
        father_name: formData.father_name || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        cnic: formData.cnic || null,
        nationality: formData.nationality || 'Pakistani',
        domicile: formData.domicile || null,
        email: formData.email || null,
        phone: formData.phone || null,
        alternate_phone: formData.alternate_phone || null,
        current_address: formData.current_address || null,
        permanent_address: formData.permanent_address || null,
        current_step: formData.current_step || 1,
        is_draft: true,
        declaration_accepted: Boolean(formData.declaration_accepted),
        status: 'draft',
      });

      if (insertError) {
        console.error('Application insert error:', insertError);
        return errorResponse('Failed to create application draft', 500);
      }
    }

    // Handle qualifications
    if (formData.qualifications && Array.isArray(formData.qualifications)) {
      await db.from('academic_qualifications').delete().eq('application_id', appId);
      const qualInserts = formData.qualifications
        .filter((q: any) => q.degree && q.board_university)
        .map((q: any, i: number) => {
          const pct = (q.obtained_marks && q.total_marks && Number(q.total_marks) > 0)
            ? (Number(q.obtained_marks) / Number(q.total_marks)) * 100
            : null;
          return {
            id: uuidv4(),
            application_id: appId,
            degree: q.degree,
            board_university: q.board_university,
            institution_name: q.institution_name || null,
            passing_year: q.passing_year ? Number(q.passing_year) : null,
            obtained_marks: q.obtained_marks ? Number(q.obtained_marks) : null,
            total_marks: q.total_marks ? Number(q.total_marks) : null,
            percentage: pct,
            sort_order: i,
          };
        });

      if (qualInserts.length > 0) {
        await db.from('academic_qualifications').insert(qualInserts);
      }
    }

    return successResponse({ id: appId, reference_number: refNum }, existing ? 200 : 201);
  } catch (error) {
    console.error('Application save error:', error);
    return errorResponse('Failed to save application', 500);
  }
}
