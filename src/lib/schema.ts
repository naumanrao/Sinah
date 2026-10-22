import { getDb } from './db';
import bcrypt from 'bcryptjs';

/**
 * Initialize the database: verify connectivity and seed essential data.
 * The PostgreSQL schema is managed via migration files in supabase/migrations/.
 * This function only seeds data that must exist for the app to function.
 */
export async function initializeDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes('placeholder')) {
    // Database credentials not configured yet, skip auto-initialization during build/offline
    return;
  }
  const supabase = getDb();

  // Verify we can query the database
  const { error: pingError } = await supabase.from('application_statuses').select('id').limit(1);
  if (pingError) {
    console.error('Database connectivity check failed:', pingError.message);
    throw new Error(`Database not reachable: ${pingError.message}. Ensure migrations have been applied.`);
  }

  // Seed default super admin if none exists
  const { data: existingAdmin } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'super_admin')
    .limit(1)
    .single();

  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync('Admin@12345', 10);
    await supabase.from('users').upsert({
      id: 'admin-root-001',
      full_name: 'System Administrator',
      email: 'admin@sinah.edu.pk',
      phone: '+92 307 1669696',
      password_hash: passwordHash,
      role: 'super_admin',
      is_active: true,
      email_verified: true,
    }, { onConflict: 'email' });
  }

  // Seed default demo student if none exists
  const { data: existingStudent } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'student@sinah.edu.pk')
    .limit(1)
    .single();

  if (!existingStudent) {
    const studentHash = bcrypt.hashSync('Student@12345', 10);
    await supabase.from('users').upsert({
      id: 'student-demo-001',
      full_name: 'Fatima Noor',
      email: 'student@sinah.edu.pk',
      phone: '+92 300 1234567',
      password_hash: studentHash,
      role: 'student',
      is_active: true,
      email_verified: true,
    }, { onConflict: 'email' });

    // Create a sample submitted application for demo student
    const year = new Date().getFullYear();
    const sampleRef = `SINAH-${year}-00001`;

    const { data: existingApp } = await supabase
      .from('applications')
      .select('id')
      .eq('id', 'app-demo-001')
      .limit(1)
      .single();

    if (!existingApp) {
      await supabase.from('applications').insert({
        id: 'app-demo-001',
        reference_number: sampleRef,
        user_id: 'student-demo-001',
        session_id: 'session-fall-2025',
        program_id: 'prog-bsn',
        status: 'under_review',
        full_name: 'Fatima Noor',
        father_name: 'Muhammad Noor',
        date_of_birth: '2005-04-12',
        gender: 'Female',
        cnic: '32304-9876543-2',
        nationality: 'Pakistani',
        domicile: 'Muzaffargarh',
        email: 'student@sinah.edu.pk',
        phone: '+92 300 1234567',
        current_address: 'Model Town, Muzaffargarh',
        permanent_address: 'Model Town, Muzaffargarh',
        current_step: 5,
        is_draft: false,
        declaration_accepted: true,
        submitted_at: new Date().toISOString(),
        student_message: 'Your application is currently under document verification by the admission committee.',
      });

      // Academic qualifications
      await supabase.from('academic_qualifications').insert([
        {
          id: 'qual-demo-1',
          application_id: 'app-demo-001',
          degree: 'Matric / SSC (Science)',
          board_university: 'BISE D.G. Khan',
          institution_name: 'Govt Girls High School',
          passing_year: 2022,
          obtained_marks: 1020,
          total_marks: 1100,
          percentage: 92.73,
          sort_order: 1,
        },
        {
          id: 'qual-demo-2',
          application_id: 'app-demo-001',
          degree: 'F.Sc / HSSC (Pre-Medical)',
          board_university: 'BISE D.G. Khan',
          institution_name: 'Punjab College',
          passing_year: 2024,
          obtained_marks: 980,
          total_marks: 1100,
          percentage: 89.09,
          sort_order: 2,
        },
      ]);
    }
  }
}

export async function generateReferenceNumber(): Promise<string> {
  const supabase = getDb();
  const year = new Date().getFullYear();
  const pattern = `SINAH-${year}-%`;

  const { count } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .like('reference_number', pattern);

  const nextNum = ((count || 0) + 1).toString().padStart(5, '0');
  return `SINAH-${year}-${nextNum}`;
}
