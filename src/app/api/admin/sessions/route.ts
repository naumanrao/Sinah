import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { getSession, requireRole } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/admin/sessions
export async function GET() {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin', 'admission_manager', 'admission_officer', 'readonly_staff'])) {
      return errorResponse('Unauthorized', 403);
    }

    const db = getDb();
    const { data: sessions, error: sessErr } = await db
      .from('admission_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (sessErr) {
      console.error('Sessions query error:', sessErr);
      return errorResponse('Failed to fetch sessions', 500);
    }

    const { data: sessionPrograms } = await db
      .from('session_programs')
      .select('*, program:programs(name, slug, category, duration)');

    const spMap = new Map<string, any[]>();
    for (const sp of (sessionPrograms || [])) {
      const list = spMap.get(sp.session_id) || [];
      list.push({
        ...sp,
        program_name: sp.program?.name,
        slug: sp.program?.slug,
        category: sp.program?.category,
        duration: sp.program?.duration,
      });
      spMap.set(sp.session_id, list);
    }

    const sessionsWithPrograms = (sessions || []).map((s: any) => ({
      ...s,
      programs: spMap.get(s.id) || [],
    }));

    return successResponse(sessionsWithPrograms);
  } catch (error) {
    console.error('Sessions fetch error:', error);
    return errorResponse('Failed to fetch sessions', 500);
  }
}

// POST /api/admin/sessions
export async function POST(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin', 'admission_manager'])) {
      return errorResponse('Unauthorized', 403);
    }

    const body = await request.json();
    const { title, academic_year, start_date, end_date, description, program_ids } = body;

    if (!title || !academic_year || !start_date || !end_date) {
      return errorResponse('Title, academic year, start date, and end date are required');
    }

    if (new Date(end_date) <= new Date(start_date)) {
      return errorResponse('End date must be after start date');
    }

    const db = getDb();
    const id = uuidv4();

    const { error: insertSessErr } = await db.from('admission_sessions').insert({
      id,
      title,
      academic_year,
      start_date,
      end_date,
      description: description || null,
      created_by: session!.userId,
      status: 'draft',
    });

    if (insertSessErr) {
      console.error('Session insert error:', insertSessErr);
      return errorResponse('Failed to create session', 500);
    }

    if (program_ids && Array.isArray(program_ids) && program_ids.length > 0) {
      const spRows = program_ids.map((pid: string) => ({
        id: uuidv4(),
        session_id: id,
        program_id: pid,
      }));
      await db.from('session_programs').insert(spRows);
    }

    return successResponse({ id }, 201);
  } catch (error) {
    console.error('Session creation error:', error);
    return errorResponse('Failed to create session', 500);
  }
}

// PUT /api/admin/sessions
export async function PUT(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin', 'admission_manager'])) {
      return errorResponse('Unauthorized', 403);
    }

    const body = await request.json();
    const { id, title, academic_year, start_date, end_date, status, description, program_ids } = body;

    if (!id) return errorResponse('Session ID is required');

    const db = getDb();
    const { data: existing, error: findErr } = await db
      .from('admission_sessions')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findErr || !existing) return errorResponse('Session not found', 404);

    const { error: updateErr } = await db.from('admission_sessions').update({
      title,
      academic_year,
      start_date,
      end_date,
      status: status || 'draft',
      description: description || null,
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (updateErr) {
      console.error('Session update error:', updateErr);
      return errorResponse('Failed to update session', 500);
    }

    if (program_ids && Array.isArray(program_ids)) {
      await db.from('session_programs').delete().eq('session_id', id);
      if (program_ids.length > 0) {
        const spRows = program_ids.map((pid: string) => ({
          id: uuidv4(),
          session_id: id,
          program_id: pid,
        }));
        await db.from('session_programs').insert(spRows);
      }
    }

    return successResponse({ id });
  } catch (error) {
    console.error('Session update error:', error);
    return errorResponse('Failed to update session', 500);
  }
}
