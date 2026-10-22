'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';

interface PendingDoc {
  id: string;
  application_id: string;
  reference_number: string;
  student_name: string;
  program_name: string;
  document_name: string;
  original_filename: string;
  stored_filename: string;
  verification_status: string;
  rejection_reason?: string;
  uploaded_at: string;
}

export default function AdminDocumentsQueuePage() {
  const [documents, setDocuments] = useState<PendingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [rejectionModalDoc, setRejectionModalDoc] = useState<PendingDoc | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/documents?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error('Error fetching documents queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [statusFilter]);

  const handleVerify = async (docId: string, status: 'verified' | 'rejected', reason = '') => {
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
        loadDocuments();
      }
    } catch {
      alert('Error updating document');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Document Verification Queue
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Fast-track verification of student CNIC, certificates, and academic DMCs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['pending', 'verified', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="text-xs text-slate-400 font-semibold">Loading documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No {statusFilter} documents found in the verification queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Document Title</th>
                  <th className="p-4">Applicant & Ref</th>
                  <th className="p-4">Program</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Uploaded</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-800">
                      <div>{doc.document_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{doc.original_filename}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{doc.student_name}</div>
                      <Link
                        href={`/admin/applications/${doc.application_id}`}
                        className="font-mono text-[11px] text-primary hover:underline font-bold"
                      >
                        {doc.reference_number}
                      </Link>
                    </td>
                    <td className="p-4 text-slate-600">{doc.program_name}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          doc.verification_status === 'verified'
                            ? 'bg-emerald-100 text-emerald-700'
                            : doc.verification_status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {doc.verification_status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-[11px]">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`/api/documents/${doc.stored_filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                        >
                          <Eye size={13} /> View
                        </a>
                        {doc.verification_status !== 'verified' && (
                          <button
                            onClick={() => handleVerify(doc.id, 'verified')}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        )}
                        {doc.verification_status !== 'rejected' && (
                          <button
                            onClick={() => setRejectionModalDoc(doc)}
                            className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                          >
                            <XCircle size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Rejection Modal */}
      {rejectionModalDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900">
              Reject {rejectionModalDoc.document_name}
            </h3>
            <p className="text-xs text-slate-500">
              State the reason for rejecting {rejectionModalDoc.student_name}&apos;s document:
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Scanned copy is illegible. Please upload clear scan."
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
                onClick={() => handleVerify(rejectionModalDoc.id, 'rejected', rejectionReason)}
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
