'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  Upload,
  Eye,
  Loader2,
  Printer,
  ShieldCheck,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  XCircle,
  BadgeCheck
} from 'lucide-react';

interface ApplicationDetail {
  id: string;
  reference_number: string;
  status: string;
  status_label?: string;
  status_color?: string;
  program_id: string;
  program_name: string;
  program_category: string;
  session_title: string;
  full_name: string;
  father_name: string;
  date_of_birth: string;
  gender: string;
  cnic: string;
  nationality: string;
  domicile: string;
  email: string;
  phone: string;
  alternate_phone: string;
  current_address: string;
  permanent_address: string;
  submitted_at: string;
  student_message: string;
  qualifications: {
    id: string;
    degree: string;
    board_university: string;
    institution_name: string;
    passing_year: number;
    obtained_marks: number;
    total_marks: number;
    percentage: number;
  }[];
  documents: {
    id: string;
    document_name: string;
    original_filename: string;
    stored_filename: string;
    file_size: number;
    mime_type: string;
    verification_status: string;
    rejection_reason?: string;
  }[];
  status_history: {
    id: string;
    from_status: string;
    to_status: string;
    to_status_label?: string;
    note?: string;
    created_at: string;
  }[];
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const applicationId = params.id as string;

  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/applications/${applicationId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setApp(data.data);
        } else {
          setError('Application not found or unauthorized.');
        }
      } catch {
        setError('Failed to fetch application details.');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user) {
      loadData();
    } else if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/dashboard/applications/${applicationId}`);
    }
  }, [applicationId, user, authLoading, router]);

  const handleDocumentReupload = async (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
    const file = e.target.files?.[0];
    if (!file || !app) return;

    setUploadingDocId(docName);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('application_id', app.id);
    formData.append('document_name', docName);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        // Refresh application
        const refreshRes = await fetch(`/api/applications/${app.id}`);
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setApp(refreshData.data);
        }
      } else {
        setError(data.error || 'Document replacement failed.');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploadingDocId(null);
    }
  };

  const printApplication = () => {
    window.print();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-slate-500 font-semibold text-sm">Loading Application Dossier...</p>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md w-full space-y-4 shadow-sm">
          <AlertTriangle size={36} className="text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Application Error</h2>
          <p className="text-slate-500 text-xs">{error || 'Unable to display this application.'}</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Workflow pipeline steps
  const workflowStages = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'eligible', label: 'Verification & Test' },
    { key: 'merit_listed', label: 'Merit List' },
    { key: 'selected', label: 'Selection' },
    { key: 'confirmed', label: 'Admission Confirmed' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-24 print:bg-white print:pt-0 print:pb-0">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Top Action Bar (hidden during print) */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} /> Back to My Applications
          </Link>

          <button
            type="button"
            onClick={printApplication}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm self-start sm:self-center"
          >
            <Printer size={16} />
            <span>Print Application / Slip</span>
          </button>
        </div>

        {/* Print Header Branding (only visible when printed) */}
        <div className="hidden print:block border-b-2 border-primary pb-4 mb-6 text-center">
          <h1 className="text-2xl font-black text-primary">SINAH INSTITUTE OF NURSING & ALLIED HEALTH SCIENCES</h1>
          <p className="text-xs text-slate-600">Official Student Admission Application Dossier • Session: {app.session_title}</p>
        </div>

        {/* Application Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary">
                {app.program_category?.replace('_', ' ')}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {app.program_name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span>Ref: <strong className="font-mono text-primary font-bold">{app.reference_number}</strong></span>
                <span>•</span>
                <span>Session: <strong>{app.session_title}</strong></span>
                <span>•</span>
                <span>Submitted: <strong>{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Draft'}</strong></span>
              </div>
            </div>

            <div className="self-start">
              <span
                className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm"
                style={{
                  backgroundColor: `${app.status_color || '#3b82f6'}15`,
                  color: app.status_color || '#3b82f6',
                  border: `1px solid ${app.status_color || '#3b82f6'}30`,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: app.status_color || '#3b82f6' }} />
                {app.status_label || app.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Admission Message / Alert if present */}
          {app.student_message && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div>
                <strong>Official Note from Admission Committee:</strong> {app.student_message}
              </div>
            </div>
          )}

          {/* Visual Status Tracker Bar (hidden during print) */}
          <div className="pt-4 border-t border-slate-100 print:hidden">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Admission Stage Progression
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {workflowStages.map((stg, idx) => (
                <div
                  key={stg.key}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1"
                >
                  <div className="text-[10px] font-bold text-slate-400">Step {idx + 1}</div>
                  <div className="text-xs font-bold text-slate-800 truncate">{stg.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Applicant Personal & Contact Details */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
            Applicant Particulars
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs pt-2">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{app.full_name}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Father / Guardian Name</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{app.father_name}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">CNIC / B-Form</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{app.cnic}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth / Gender</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{app.date_of_birth} ({app.gender})</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">District Domicile</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{app.domicile}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{app.phone}</span>
            </div>

            <div className="sm:col-span-2 md:col-span-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Postal Address</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{app.current_address}</span>
            </div>
          </div>
        </div>

        {/* Academic Qualifications Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
            Academic Record
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Degree / Certificate</th>
                  <th className="p-3">Board / University</th>
                  <th className="p-3">Passing Year</th>
                  <th className="p-3 text-right">Marks (Obt / Total)</th>
                  <th className="p-3 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {app.qualifications?.map((q) => (
                  <tr key={q.id}>
                    <td className="p-3 font-bold text-slate-800">{q.degree}</td>
                    <td className="p-3 text-slate-600">{q.board_university}</td>
                    <td className="p-3 text-slate-600">{q.passing_year}</td>
                    <td className="p-3 text-right text-slate-800 font-semibold">{q.obtained_marks} / {q.total_marks}</td>
                    <td className="p-3 text-right font-bold text-primary">{q.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Uploaded Documents & Verification Review */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
            Uploaded Verification Documents
          </h3>

          <div className="space-y-3 pt-2">
            {app.documents?.map((doc) => {
              const isRejected = doc.verification_status === 'rejected' || doc.verification_status === 'replacement_required';
              const isUploading = uploadingDocId === doc.document_name;

              return (
                <div
                  key={doc.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs sm:text-sm">{doc.document_name}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          doc.verification_status === 'verified'
                            ? 'bg-emerald-100 text-emerald-700'
                            : isRejected
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {doc.verification_status}
                      </span>
                    </div>

                    {doc.rejection_reason && (
                      <p className="text-xs text-red-600 mt-1 font-medium">
                        Reason: {doc.rejection_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <a
                      href={`/api/documents/${doc.stored_filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5"
                    >
                      <Eye size={14} /> View File
                    </a>

                    {isRejected && (
                      <label className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all flex items-center gap-1.5 cursor-pointer">
                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        <span>Re-upload File</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          onChange={(e) => handleDocumentReupload(e, doc.document_name)}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status History Trail (hidden during print) */}
        {app.status_history && app.status_history.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4 print:hidden">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
              Application Timeline & Audit Trail
            </h3>

            <div className="space-y-3 pt-2">
              {app.status_history.map((hist) => (
                <div key={hist.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">
                      Status changed to: {hist.to_status_label || hist.to_status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-slate-400 ml-2 text-[11px]">
                      {new Date(hist.created_at).toLocaleString()}
                    </span>
                    {hist.note && <p className="text-slate-600 mt-0.5">{hist.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
