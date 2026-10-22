import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { getSession, requireRole } from '@/lib/auth';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/admin/programs - List all programs
export async function GET() {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin', 'admission_manager', 'admission_officer', 'readonly_staff'])) {
      return errorResponse('Unauthorized', 403);
    }

    const db = getDb();
    const { data: programs, error: progErr } = await db
      .from('programs')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (progErr) {
      console.error('Programs query error:', progErr);
      return errorResponse('Failed to fetch programs', 500);
    }

    const { data: allDocs } = await db
      .from('program_documents')
      .select('*')
      .order('sort_order', { ascending: true });

    const { data: allCriteria } = await db
      .from('merit_criteria')
      .select('*')
      .order('sort_order', { ascending: true });

    const docsByProgram = new Map<string, any[]>();
    for (const d of (allDocs || [])) {
      const list = docsByProgram.get(d.program_id) || [];
      list.push(d);
      docsByProgram.set(d.program_id, list);
    }

    const criteriaByProgram = new Map<string, any[]>();
    for (const c of (allCriteria || [])) {
      const list = criteriaByProgram.get(c.program_id) || [];
      list.push(c);
      criteriaByProgram.set(c.program_id, list);
    }

    const programsWithDocs = (programs || []).map((p: any) => ({
      ...p,
      documents: docsByProgram.get(p.id) || [],
      merit_criteria: criteriaByProgram.get(p.id) || [],
    }));

    return successResponse(programsWithDocs);
  } catch (error) {
    console.error('Programs fetch error:', error);
    return errorResponse('Failed to fetch programs', 500);
  }
}

// POST /api/admin/programs - Create a program
export async function POST(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin', 'admission_manager'])) {
      return errorResponse('Unauthorized', 403);
    }

    const body = await request.json();
    const { name, category, description, duration, eligibility, total_seats, application_fee, documents, merit_criteria } = body;

    if (!name) return errorResponse('Program name is required');

    const db = getDb();
    const id = uuidv4();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Check slug uniqueness
    const { data: existing } = await db
      .from('programs')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) return errorResponse('A program with a similar name already exists');

    const { data: maxOrderData } = await db
      .from('programs')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const maxOrder = maxOrderData?.sort_order || 0;

    const { error: insertProgErr } = await db.from('programs').insert({
      id,
      name,
      slug,
      category: category || 'nursing',
      description: description || null,
      duration: duration || null,
      eligibility: eligibility || null,
      total_seats: total_seats ? Number(total_seats) : null,
      application_fee: application_fee ? Number(application_fee) : 0,
      sort_order: maxOrder + 1,
      is_active: true,
    });

    if (insertProgErr) {
      console.error('Program insert error:', insertProgErr);
      return errorResponse('Failed to create program', 500);
    }

    // Insert required documents
    if (documents && Array.isArray(documents) && documents.length > 0) {
      const docRows = documents.map((doc: any, i: number) => ({
        id: uuidv4(),
        program_id: id,
        document_name: doc.document_name,
        document_description: doc.document_description || null,
        is_required: doc.is_required !== false,
        max_size_mb: doc.max_size_mb || 5,
        allowed_types: doc.allowed_types || 'image/jpeg,image/png,application/pdf',
        sort_order: i,
      }));
      await db.from('program_documents').insert(docRows);
    }

    // Insert merit criteria
    if (merit_criteria && Array.isArray(merit_criteria) && merit_criteria.length > 0) {
      const critRows = merit_criteria.map((c: any, i: number) => ({
        id: uuidv4(),
        program_id: id,
        criteria_name: c.criteria_name,
        criteria_type: c.criteria_type || 'academic_marks',
        weight_percentage: c.weight_percentage ? Number(c.weight_percentage) : 0,
        max_score: c.max_score ? Number(c.max_score) : 100,
        description: c.description || null,
        sort_order: i,
      }));
      await db.from('merit_criteria').insert(critRows);
    }

    return successResponse({ id, slug }, 201);
  } catch (error) {
    console.error('Program creation error:', error);
    return errorResponse('Failed to create program', 500);
  }
}

// PUT /api/admin/programs - Update a program
export async function PUT(request: NextRequest) {
  await ensureDbInitialized();
  try {
    const session = await getSession();
    if (!requireRole(session, ['super_admin', 'admission_manager'])) {
      return errorResponse('Unauthorized', 403);
    }

    const body = await request.json();
    const { id, name, category, description, duration, eligibility, total_seats, application_fee, is_active, documents, merit_criteria } = body;

    if (!id) return errorResponse('Program ID is required');

    const db = getDb();
    const { data: existing, error: findErr } = await db
      .from('programs')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findErr || !existing) return errorResponse('Program not found', 404);

    const { error: updateProgErr } = await db.from('programs').update({
      name,
      category,
      description: description || null,
      duration: duration || null,
      eligibility: eligibility || null,
      total_seats: total_seats !== undefined && total_seats !== null ? Number(total_seats) : null,
      application_fee: application_fee !== undefined && application_fee !== null ? Number(application_fee) : 0,
      is_active: is_active !== false,
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (updateProgErr) {
      console.error('Program update error:', updateProgErr);
      return errorResponse('Failed to update program', 500);
    }

    // Replace documents
    if (documents && Array.isArray(documents)) {
      await db.from('program_documents').delete().eq('program_id', id);
      if (documents.length > 0) {
        const docRows = documents.map((doc: any, i: number) => ({
          id: doc.id || uuidv4(),
          program_id: id,
          document_name: doc.document_name,
          document_description: doc.document_description || null,
          is_required: doc.is_required !== false,
          max_size_mb: doc.max_size_mb || 5,
          allowed_types: doc.allowed_types || 'image/jpeg,image/png,application/pdf',
          sort_order: i,
        }));
        await db.from('program_documents').insert(docRows);
      }
    }

    // Replace merit criteria
    if (merit_criteria && Array.isArray(merit_criteria)) {
      await db.from('merit_criteria').delete().eq('program_id', id);
      if (merit_criteria.length > 0) {
        const critRows = merit_criteria.map((c: any, i: number) => ({
          id: c.id || uuidv4(),
          program_id: id,
          criteria_name: c.criteria_name,
          criteria_type: c.criteria_type || 'academic_marks',
          weight_percentage: c.weight_percentage ? Number(c.weight_percentage) : 0,
          max_score: c.max_score ? Number(c.max_score) : 100,
          description: c.description || null,
          sort_order: i,
        }));
        await db.from('merit_criteria').insert(critRows);
      }
    }

    return successResponse({ id });
  } catch (error) {
    console.error('Program update error:', error);
    return errorResponse('Failed to update program', 500);
  }
}
