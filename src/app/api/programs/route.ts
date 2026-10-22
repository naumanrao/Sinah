import { getDb } from '@/lib/db';
import { ensureDbInitialized, successResponse, errorResponse } from '@/lib/api-utils';

// GET /api/programs - Public endpoint for open programs
export async function GET() {
  await ensureDbInitialized();
  try {
    const db = getDb();

    // Fetch program documents
    const { data: allDocs } = await db
      .from('program_documents')
      .select('id, program_id, document_name, document_description, is_required, max_size_mb, allowed_types, sort_order')
      .order('sort_order', { ascending: true });

    // Try fetching programs linked to open sessions
    const { data: sessionPrograms, error: spError } = await db
      .from('session_programs')
      .select(`
        available_seats,
        session_id,
        program:programs!inner (
          id, name, slug, category, description, duration, eligibility, total_seats, application_fee, is_active, sort_order
        ),
        session:admission_sessions!inner (
          id, title, academic_year, start_date, end_date, status
        )
      `)
      .eq('is_active', true)
      .eq('program.is_active', true)
      .eq('session.status', 'open');

    if (!spError && sessionPrograms && sessionPrograms.length > 0) {
      const result = sessionPrograms.map((sp: any) => {
        const p = sp.program;
        const s = sp.session;
        const docs = (allDocs || [])
          .filter((d: any) => d.program_id === p.id)
          .map(({ program_id, ...rest }: any) => rest);

        return {
          ...p,
          available_seats: sp.available_seats,
          session_id: sp.session_id,
          session_title: s?.title,
          start_date: s?.start_date,
          end_date: s?.end_date,
          academic_year: s?.academic_year,
          required_documents: docs,
        };
      }).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name));

      return successResponse(result);
    }

    // Fallback: Return all active programs if no open session-program links found
    const { data: activePrograms, error: pError } = await db
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (pError) {
      console.error('Error fetching programs:', pError);
      return errorResponse('Failed to fetch programs', 500);
    }

    const fallbackResult = (activePrograms || []).map((p: any) => {
      const docs = (allDocs || [])
        .filter((d: any) => d.program_id === p.id)
        .map(({ program_id, ...rest }: any) => rest);
      return {
        ...p,
        available_seats: p.total_seats,
        required_documents: docs,
      };
    });

    return successResponse(fallbackResult);
  } catch (error) {
    console.error('Public programs fetch error:', error);
    return errorResponse('Failed to fetch programs', 500);
  }
}
