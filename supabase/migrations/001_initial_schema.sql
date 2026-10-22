-- ============================================================
-- SINAH Institute Admission Management System
-- PostgreSQL Migration — Initial Schema
-- Converts the existing SQLite schema to PostgreSQL
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. Users table (students, admins, staff)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student'
    CHECK (role IN ('super_admin','admission_manager','admission_officer','finance_officer','readonly_staff','student')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Admission sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS admission_sessions (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  title TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','open','paused','closed','archived')),
  description TEXT,
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. Academic programs
-- ============================================================
CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'nursing'
    CHECK (category IN ('nursing','allied_health','other')),
  description TEXT,
  duration TEXT,
  eligibility TEXT,
  total_seats INTEGER,
  application_fee NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. Link programs to admission sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS session_programs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  session_id TEXT NOT NULL REFERENCES admission_sessions(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  available_seats INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(session_id, program_id)
);

-- ============================================================
-- 5. Required documents configuration per program
-- ============================================================
CREATE TABLE IF NOT EXISTS program_documents (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT true,
  max_size_mb INTEGER NOT NULL DEFAULT 5,
  allowed_types TEXT NOT NULL DEFAULT 'image/jpeg,image/png,application/pdf',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- 6. Merit criteria per program
-- ============================================================
CREATE TABLE IF NOT EXISTS merit_criteria (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  criteria_name TEXT NOT NULL,
  criteria_type TEXT NOT NULL
    CHECK (criteria_type IN ('academic_marks','entry_test','interview','other')),
  weight_percentage NUMERIC NOT NULL DEFAULT 0,
  max_score NUMERIC NOT NULL DEFAULT 100,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- 7. Application status types (configurable workflow)
-- ============================================================
CREATE TABLE IF NOT EXISTS application_statuses (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#64748b',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_terminal BOOLEAN NOT NULL DEFAULT false,
  student_visible BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- 8. Student applications
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  reference_number TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  session_id TEXT NOT NULL REFERENCES admission_sessions(id),
  program_id TEXT NOT NULL REFERENCES programs(id),
  status TEXT NOT NULL DEFAULT 'draft',

  -- Personal info
  full_name TEXT,
  father_name TEXT,
  date_of_birth TEXT,
  gender TEXT,
  cnic TEXT,
  nationality TEXT DEFAULT 'Pakistani',
  domicile TEXT,

  -- Contact info
  email TEXT,
  phone TEXT,
  alternate_phone TEXT,
  current_address TEXT,
  permanent_address TEXT,

  -- Form progress
  current_step INTEGER NOT NULL DEFAULT 1,
  is_draft BOOLEAN NOT NULL DEFAULT true,
  declaration_accepted BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Reviewer
  assigned_reviewer TEXT REFERENCES users(id),

  -- Notes visible to student
  student_message TEXT,

  UNIQUE(user_id, session_id, program_id)
);

-- ============================================================
-- 9. Academic qualifications for applications
-- ============================================================
CREATE TABLE IF NOT EXISTS academic_qualifications (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  board_university TEXT NOT NULL,
  institution_name TEXT,
  passing_year INTEGER,
  obtained_marks NUMERIC,
  total_marks NUMERIC,
  percentage NUMERIC,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- 10. Uploaded documents for applications
-- ============================================================
CREATE TABLE IF NOT EXISTS uploaded_documents (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  program_document_id TEXT REFERENCES program_documents(id),
  document_name TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  storage_path TEXT,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','verified','rejected','replacement_required')),
  rejection_reason TEXT,
  verified_by TEXT REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 11. Application status history (audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS application_status_history (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by TEXT NOT NULL REFERENCES users(id),
  note TEXT,
  internal_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 12. Internal reviewer notes
-- ============================================================
CREATE TABLE IF NOT EXISTS reviewer_notes (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id),
  note TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. Merit scores
-- ============================================================
CREATE TABLE IF NOT EXISTS merit_scores (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  criteria_id TEXT NOT NULL REFERENCES merit_criteria(id),
  score NUMERIC NOT NULL DEFAULT 0,
  entered_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(application_id, criteria_id)
);

-- ============================================================
-- 14. Merit lists
-- ============================================================
CREATE TABLE IF NOT EXISTS merit_lists (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  session_id TEXT NOT NULL REFERENCES admission_sessions(id),
  program_id TEXT NOT NULL REFERENCES programs(id),
  title TEXT NOT NULL,
  list_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','provisional','final','published')),
  published_at TIMESTAMPTZ,
  published_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 15. Merit list entries
-- ============================================================
CREATE TABLE IF NOT EXISTS merit_list_entries (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  merit_list_id TEXT NOT NULL REFERENCES merit_lists(id) ON DELETE CASCADE,
  application_id TEXT NOT NULL REFERENCES applications(id),
  merit_score NUMERIC NOT NULL,
  rank INTEGER NOT NULL,
  selection_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (selection_status IN ('pending','selected','waitlisted','rejected')),
  UNIQUE(merit_list_id, application_id)
);

-- ============================================================
-- 16. Fee invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS fee_invoices (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','verified','overdue','waived')),
  payment_reference TEXT,
  payment_date DATE,
  verified_by TEXT REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  voucher_number TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 17. Notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info'
    CHECK (type IN ('info','success','warning','error')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 18. Audit log
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_session ON applications(session_id);
CREATE INDEX IF NOT EXISTS idx_applications_program ON applications(program_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_reference ON applications(reference_number);
CREATE INDEX IF NOT EXISTS idx_qualifications_application ON academic_qualifications(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_application ON uploaded_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_status_history_application ON application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_merit_scores_application ON merit_scores(application_id);

-- ============================================================
-- SEED: Default Application Statuses
-- ============================================================
INSERT INTO application_statuses (id, name, label, color, sort_order, is_terminal, student_visible) VALUES
  ('s1', 'draft', 'Draft', '#94a3b8', 0, false, true),
  ('s2', 'submitted', 'Submitted', '#3b82f6', 1, false, true),
  ('s3', 'under_review', 'Under Initial Review', '#8b5cf6', 2, false, true),
  ('s4', 'documents_required', 'Documents Required', '#f59e0b', 3, false, true),
  ('s5', 'documents_resubmitted', 'Documents Resubmitted', '#06b6d4', 4, false, true),
  ('s6', 'eligible', 'Eligible', '#22c55e', 5, false, true),
  ('s7', 'ineligible', 'Ineligible', '#ef4444', 6, true, true),
  ('s8', 'test_scheduled', 'Test/Interview Scheduled', '#a855f7', 7, false, true),
  ('s9', 'test_completed', 'Test/Interview Completed', '#6366f1', 8, false, true),
  ('s10', 'merit_listed', 'Merit List Published', '#14b8a6', 9, false, true),
  ('s11', 'selected', 'Selected', '#22c55e', 10, false, true),
  ('s12', 'waitlisted', 'Waitlisted', '#eab308', 11, false, true),
  ('s13', 'admission_offered', 'Admission Offered', '#10b981', 12, false, true),
  ('s14', 'fee_pending', 'Fee Pending', '#f97316', 13, false, true),
  ('s15', 'fee_verified', 'Fee Verified', '#059669', 14, false, true),
  ('s16', 'confirmed', 'Admission Confirmed', '#16a34a', 15, true, true),
  ('s17', 'rejected', 'Rejected', '#dc2626', 16, true, true),
  ('s18', 'withdrawn', 'Withdrawn', '#6b7280', 17, true, true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED: Default Programs
-- ============================================================
INSERT INTO programs (id, name, slug, category, description, duration, eligibility, total_seats, application_fee, sort_order) VALUES
  ('prog-bsn', 'BS Nursing (Generic)', 'bs-nursing-generic', 'nursing',
   '4 Years degree program recognized by PNC, affiliated with NUMS/UHS. Prepares professional registered nurses for hospitals and healthcare systems globally.',
   '4 Years + 1 Year Internship',
   'F.Sc (Pre-Medical) with minimum 50% marks (Physics, Chemistry, Biology). Age limit: 14-35 years. Male & Female candidates eligible.',
   100, 2000, 1),
  ('prog-post-rn', 'Post RN BSN', 'post-rn-bsn', 'nursing',
   '2 Years degree program for registered diploma nurses aiming for career advancement, nursing education, and leadership positions.',
   '2 Years',
   '3-year Diploma in General Nursing + 1-year Midwifery/Specialty. Valid PNC registration card + minimum 1 year clinical experience.',
   50, 2000, 2),
  ('prog-lhv', 'Lady Health Visitor (LHV)', 'lady-health-visitor', 'nursing',
   '2 Years diploma program focused on maternal, child healthcare and reproductive health in community healthcare centers.',
   '2 Years',
   'Matriculation with Science (Physics, Chemistry, Biology) minimum 45% marks. Age limit: 14-35 years. Female candidates only.',
   40, 1500, 3),
  ('prog-cmw', 'Community Midwifery (CMW)', 'community-midwifery', 'nursing',
   '2 Years diploma program training midwives for maternal and newborn care in rural and urban healthcare facilities.',
   '2 Years',
   'Matriculation with Science or Arts (minimum 45% marks). Age limit: 14-40 years. Female candidates only.',
   30, 1500, 4),
  ('prog-pharmacy-tech', 'Pharmacy Technician', 'pharmacy-technician', 'allied_health',
   '2 Years category-B diploma program registered with Pharmacy Council of Pakistan for pharmaceutical practice and clinical assistance.',
   '2 Years',
   'Matriculation with Science (Biology/Computer) with minimum 45% marks.',
   50, 1500, 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: Program Document Requirements
-- ============================================================
DO $$
DECLARE
  prog_ids TEXT[] := ARRAY['prog-bsn','prog-post-rn','prog-lhv','prog-cmw','prog-pharmacy-tech'];
  pid TEXT;
BEGIN
  FOREACH pid IN ARRAY prog_ids
  LOOP
    INSERT INTO program_documents (id, program_id, document_name, document_description, is_required, max_size_mb, allowed_types, sort_order) VALUES
      (pid || '-doc-1', pid, 'Passport Size Photograph', 'Recent blue background photograph (JPEG/PNG)', true, 3, 'image/jpeg,image/png', 1),
      (pid || '-doc-2', pid, 'CNIC / B-Form (Front & Back)', 'Scanned copy of Applicant CNIC or B-Form', true, 5, 'image/jpeg,image/png,application/pdf', 2),
      (pid || '-doc-3', pid, 'Father / Guardian CNIC', 'Scanned copy of Father or Guardian CNIC', true, 5, 'image/jpeg,image/png,application/pdf', 3),
      (pid || '-doc-4', pid, 'Matric / SSC Certificate & DMC', 'Matriculation Marks Sheet & Passing Certificate', true, 5, 'image/jpeg,image/png,application/pdf', 4),
      (pid || '-doc-5', pid, 'F.Sc / HSSC Marks Sheet', 'Intermediate DMC / Result Card (if applicable)', false, 5, 'image/jpeg,image/png,application/pdf', 5),
      (pid || '-doc-6', pid, 'Domicile Certificate', 'District Domicile Certificate of applicant/father', true, 5, 'image/jpeg,image/png,application/pdf', 6)
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- ============================================================
-- SEED: Merit Criteria
-- ============================================================
DO $$
DECLARE
  prog_ids TEXT[] := ARRAY['prog-bsn','prog-post-rn','prog-lhv','prog-cmw','prog-pharmacy-tech'];
  pid TEXT;
BEGIN
  FOREACH pid IN ARRAY prog_ids
  LOOP
    INSERT INTO merit_criteria (id, program_id, criteria_name, criteria_type, weight_percentage, max_score, sort_order) VALUES
      (pid || '-m1', pid, 'Matric Marks', 'academic_marks', 30, 100, 1),
      (pid || '-m2', pid, 'Intermediate / Entry Test', 'entry_test', 50, 100, 2),
      (pid || '-m3', pid, 'Interview & Aptitude', 'interview', 20, 100, 3)
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- ============================================================
-- SEED: Active Admission Session
-- ============================================================
INSERT INTO admission_sessions (id, title, academic_year, start_date, end_date, status, description) VALUES
  ('session-fall-2025',
   'Fall ' || EXTRACT(YEAR FROM CURRENT_DATE)::text || ' / Spring ' || (EXTRACT(YEAR FROM CURRENT_DATE) + 1)::text || ' Admissions',
   EXTRACT(YEAR FROM CURRENT_DATE)::text || '-' || (EXTRACT(YEAR FROM CURRENT_DATE) + 1)::text,
   (EXTRACT(YEAR FROM CURRENT_DATE)::text || '-01-01')::date,
   ((EXTRACT(YEAR FROM CURRENT_DATE) + 1)::text || '-12-31')::date,
   'open',
   'Official online admissions open for BSN, Post-RN, LHV, CMW, and Allied Health programs at SINAH Institute.')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: Link Programs to Session
-- ============================================================
INSERT INTO session_programs (id, session_id, program_id, available_seats, is_active) VALUES
  ('sp-session-fall-2025-prog-bsn', 'session-fall-2025', 'prog-bsn', 100, true),
  ('sp-session-fall-2025-prog-post-rn', 'session-fall-2025', 'prog-post-rn', 50, true),
  ('sp-session-fall-2025-prog-lhv', 'session-fall-2025', 'prog-lhv', 40, true),
  ('sp-session-fall-2025-prog-cmw', 'session-fall-2025', 'prog-cmw', 30, true),
  ('sp-session-fall-2025-prog-pharmacy-tech', 'session-fall-2025', 'prog-pharmacy-tech', 50, true)
ON CONFLICT (session_id, program_id) DO NOTHING;

-- ============================================================
-- SEED: Storage bucket configuration
-- Run this in Supabase SQL editor or via Dashboard:
-- 1. Create a PRIVATE bucket named "admission-documents"
-- 2. Ensure no public access policies
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('admission-documents', 'admission-documents', false)
-- ON CONFLICT (id) DO NOTHING;
