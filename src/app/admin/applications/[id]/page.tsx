'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertCircle,
  FileCheck,
  Building,
  GraduationCap,
  MessageSquare,
  ShieldAlert,
  Loader2,
  Printer
} from 'lucide-react';

interface ApplicationDossier {
  id: string;
  reference_number: string;
  status: string;
  status_label: string;
  status_color: string;
  program_name: string;
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
  created_at: string;
  student_message?: string;
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
    verified_at?: string;
  }[];
  status_history: {
    id: string;
    from_status: string;
    to_status: string;
    to_status_label: string;
    changed_by_name: string;
    note?: string;
    internal_note?: string;
    created_at: string;
  }[];
  reviewer_notes: {
    id: string;
    author_name: string;
    note: string;
    created_at: string;
  }[];
  statuses: {
    name: string;
    label: string;
    color: string;
  }[];
}

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [dossier, setDossier] = useState<ApplicationDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Status Change Form
  const [selectedStatus, setSelectedStatus] = useState('');
  const [studentMessage, setStudentMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');

  // Reviewer Note
  const [newNote, setNewNote] = useState('');

  // Document action
  const [rejectionModalDoc, setRejectionModalDoc] = useState<{ id: string; name: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadDossier = async () => {
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setDossier(data.data);
        setSelectedStatus(data.data.status);
        setStudentMessage(data.data.student_message || '');
      } else {
        setError('Application not found');
      }
    } catch {
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDossier();
  }, [applicationId]);

  // Handle Application Status Transition
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          status: selectedStatus,
          note: studentMessage,
          internal_note: internalNote,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessNotice('Application status updated successfully.');
        setInternalNote('');
        loadDossier();
      } else {
        setError(data.error || 'Failed to update status');
      }
    } catch {
      setError('An error occurred during update');
    } finally {
      setUpdating(false);
    }
  };

  // Verify / Reject Document
  const handleVerifyDoc = async (docId: string, status: 'verified' | 'rejected', reason = '') => {
    try {
      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: docId,
          status,
          rejection_reason: reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRejectionModalDoc(null);
        setRejectionReason('');
        loadDossier();
      } else {
        alert(data.error || 'Document update failed');
      }
    } catch {
      alert('Error updating document verification');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-slate-500 text-xs font-semibold">Loading Dossier...</p>
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle size={36} className="text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">{error || 'Dossier not found'}</h2>
        <Link href="/admin/applications" className="text-xs text-primary font-bold hover:underline">
          ← Back to Applications Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/applications"
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {dossier.reference_number}
              </h1>
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${dossier.status_color || '#3b82f6'}15`,
                  color: dossier.status_color || '#3b82f6',
                }}
              >
                {dossier.status_label || dossier.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Applicant: <strong>{dossier.full_name}</strong> • Program: {dossier.program_name}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition-all flex items-center gap-2 self-start sm:self-center"
        >
          <Printer size={15} />
          <span>Print Dossier</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dossier Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Personal Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Applicant Personal Particulars
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">Full Name</span>
                <span className="font-bold text-slate-800">{dossier.full_name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">Father Name</span>
                <span className="font-bold text-slate-800">{dossier.father_name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">CNIC / B-Form</span>
                <span className="font-bold text-slate-800">{dossier.cnic}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">Gender / DOB</span>
                <span className="font-semibold text-slate-800">{dossier.gender} • {dossier.date_of_birth}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">District Domicile</span>
                <span className="font-semibold text-slate-800">{dossier.domicile}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">Phone / WhatsApp</span>
                <span className="font-semibold text-slate-800">{dossier.phone}</span>
              </div>
              <div className="sm:col-span-2 md:col-span-3 p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] font-bold">Postal Address</span>
                <span className="font-semibold text-slate-800">{dossier.current_address}</span>
              </div>
            </div>
          </div>

          {/* Academic Qualifications Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Academic Record & Marks
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Degree / Level</th>
                    <th className="p-3">Board / University</th>
                    <th className="p-3">Year</th>
                    <th className="p-3 text-right">Marks</th>
                    <th className="p-3 text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dossier.qualifications?.map((q) => (
                    <tr key={q.id}>
                      <td className="p-3 font-bold text-slate-800">{q.degree}</td>
                      <td className="p-3 text-slate-600">{q.board_university}</td>
                      <td className="p-3 text-slate-600">{q.passing_year}</td>
                      <td className="p-3 text-right text-slate-800">{q.obtained_marks} / {q.total_marks}</td>
                      <td className="p-3 text-right font-bold text-primary">{q.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Uploaded Documents Verification */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Uploaded Documents & Verification Actions
            </h3>
            <div className="space-y-3">
              {dossier.documents?.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs">{doc.document_name}</span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          doc.verification_status === 'verified'
                            ? 'bg-emerald-100 text-emerald-700'
                            : doc.verification_status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {doc.verification_status}
                      </span>
                    </div>
                    {doc.rejection_reason && (
                      <p className="text-[11px] text-red-600 mt-0.5">Note: {doc.rejection_reason}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/documents/${doc.stored_filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 flex items-center gap-1 shadow-sm"
                    >
                      <Eye size={13} /> View
                    </a>
                    {doc.verification_status !== 'verified' && (
                      <button
                        onClick={() => handleVerifyDoc(doc.id, 'verified')}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
                      >
                        <CheckCircle2 size={13} /> Verify
                      </button>
                    )}
                    {doc.verification_status !== 'rejected' && (
                      <button
                        onClick={() => setRejectionModalDoc({ id: doc.id, name: doc.document_name })}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 flex items-center gap-1"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Status Transition & History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Transition Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Update Admission Status
            </h3>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Select Target Status *
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {dossier.statuses?.map((st) => (
                    <option key={st.name} value={st.name}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Message to Applicant (Visible in Portal)
                </label>
                <textarea
                  rows={3}
                  value={studentMessage}
                  onChange={(e) => setStudentMessage(e.target.value)}
                  placeholder="e.g. Please appear for interview on 20th Oct with original documents."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Internal Staff Note (Audit Trail Only)
                </label>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="e.g. Verified by committee, qualified for entry test."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/95 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-70"
              >
                {updating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Save Status & Notify Student</span>
              </button>
            </form>
          </div>

          {/* Timeline History */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Audit Trail & Status History
            </h3>
            <div className="space-y-3 pt-1">
              {dossier.status_history?.map((h) => (
                <div key={h.id} className="text-xs space-y-1 pb-2 border-b border-slate-100 last:border-0">
                  <div className="font-bold text-slate-800">
                    → {h.to_status_label || h.to_status}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    By {h.changed_by_name || 'System'} • {new Date(h.created_at).toLocaleString()}
                  </div>
                  {h.note && <div className="text-[11px] text-slate-600">Student Msg: {h.note}</div>}
                  {h.internal_note && <div className="text-[11px] text-purple-700 font-semibold">Staff: {h.internal_note}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Document Rejection Reason Modal */}
      {rejectionModalDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">
              Reject / Request Replacement for {rejectionModalDoc.name}
            </h3>
            <p className="text-xs text-slate-500">
              Please provide the reason. The student will be notified and requested to re-upload.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Scanned image is blurry. Please upload high-resolution copy of original certificate."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalDoc(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleVerifyDoc(rejectionModalDoc.id, 'rejected', rejectionReason)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
