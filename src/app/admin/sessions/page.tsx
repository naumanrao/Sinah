'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  GraduationCap
} from 'lucide-react';

interface Session {
  id: string;
  title: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'open' | 'paused' | 'closed' | 'archived';
  description?: string;
  programs?: { id: string; name: string }[];
  application_count?: number;
}

interface Program {
  id: string;
  name: string;
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const [form, setForm] = useState({
    title: '',
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    start_date: '',
    end_date: '',
    status: 'open',
    description: '',
    program_ids: [] as string[],
  });

  const loadData = async () => {
    try {
      const [sRes, pRes] = await Promise.all([
        fetch('/api/admin/sessions'),
        fetch('/api/admin/programs'),
      ]);
      const sData = await sRes.json();
      const pData = await pRes.json();

      if (sData.success) setSessions(sData.data);
      if (pData.success) setPrograms(pData.data);
    } catch {
      setError('Failed to load admission sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingSession(null);
    setForm({
      title: `Spring ${new Date().getFullYear() + 1} Admissions`,
      academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'open',
      description: 'Online admissions session for nursing and allied health programs.',
      program_ids: programs.map((p) => p.id),
    });
    setModalOpen(true);
  };

  const openEditModal = (session: Session) => {
    setEditingSession(session);
    setForm({
      title: session.title,
      academic_year: session.academic_year,
      start_date: session.start_date,
      end_date: session.end_date,
      status: session.status,
      description: session.description || '',
      program_ids: session.programs?.map((p) => p.id) || [],
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = '/api/admin/sessions';
      const method = editingSession ? 'PUT' : 'POST';
      const body = editingSession ? { ...form, id: editingSession.id } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setModalOpen(false);
        loadData();
      } else {
        setError(data.error || 'Failed to save session');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-slate-500 text-xs font-semibold">Loading Sessions...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      draft: 'bg-slate-100 text-slate-800 border-slate-200',
      paused: 'bg-amber-100 text-amber-800 border-amber-200',
      closed: 'bg-red-100 text-red-800 border-red-200',
      archived: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[status] || colors.draft}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admission Sessions</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Configure application windows, session statuses, and active academic programs
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all text-xs flex items-center gap-2 self-start sm:self-center"
        >
          <Plus size={16} />
          <span>Create New Session</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((sess) => (
          <div
            key={sess.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono font-bold text-slate-400">
                  Year: {sess.academic_year}
                </span>
                {getStatusBadge(sess.status)}
              </div>

              <h3 className="text-lg font-bold text-slate-900">{sess.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{sess.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Start Date</span>
                  <span className="font-semibold text-slate-700">{sess.start_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">End Date</span>
                  <span className="font-semibold text-slate-700">{sess.end_date}</span>
                </div>
              </div>

              {sess.programs && sess.programs.length > 0 && (
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Included Programs ({sess.programs.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sess.programs.map((p) => (
                      <span
                        key={p.id}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => openEditModal(sess)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
              >
                <Edit2 size={14} /> Edit Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {editingSession ? 'Edit Admission Session' : 'Create Admission Session'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.academic_year}
                    onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Session Status *
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="draft">Draft</option>
                    <option value="open">Open (Publicly Accepting)</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Assign Programs to this Session
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {programs.map((prog) => {
                    const isChecked = form.program_ids.includes(prog.id);
                    return (
                      <label key={prog.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, program_ids: [...form.program_ids, prog.id] });
                            } else {
                              setForm({ ...form, program_ids: form.program_ids.filter((id) => id !== prog.id) });
                            }
                          }}
                          className="rounded text-primary focus:ring-primary/20"
                        />
                        <span>{prog.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/95 shadow-md disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
