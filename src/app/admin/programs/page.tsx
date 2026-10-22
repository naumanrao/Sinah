'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  FileCheck,
  Award,
  Loader2,
  AlertCircle,
  Clock,
  Coins
} from 'lucide-react';

interface ProgramItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  duration: string;
  eligibility: string;
  total_seats: number;
  application_fee: number;
  is_active: number;
  documents?: { id: string; document_name: string; is_required: number }[];
  merit_criteria?: { id: string; criteria_name: string; weight_percentage: number }[];
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<ProgramItem | null>(null);

  const [form, setForm] = useState({
    name: '',
    category: 'nursing',
    description: '',
    duration: '',
    eligibility: '',
    total_seats: 50,
    application_fee: 2000,
  });

  const loadPrograms = async () => {
    try {
      const res = await fetch('/api/admin/programs');
      const data = await res.json();
      if (data.success) {
        setPrograms(data.data);
      }
    } catch {
      setError('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const openCreateModal = () => {
    setEditingProg(null);
    setForm({
      name: '',
      category: 'nursing',
      description: '',
      duration: '4 Years',
      eligibility: 'F.Sc Pre-Medical 50%',
      total_seats: 50,
      application_fee: 2000,
    });
    setModalOpen(true);
  };

  const openEditModal = (p: ProgramItem) => {
    setEditingProg(p);
    setForm({
      name: p.name,
      category: p.category,
      description: p.description || '',
      duration: p.duration || '',
      eligibility: p.eligibility || '',
      total_seats: p.total_seats || 50,
      application_fee: p.application_fee || 0,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = '/api/admin/programs';
      const method = editingProg ? 'PUT' : 'POST';
      const body = editingProg ? { ...form, id: editingProg.id } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setModalOpen(false);
        loadPrograms();
      } else {
        setError(data.error || 'Failed to save program');
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
        <p className="text-slate-500 text-xs font-semibold">Loading Programs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academic Programs</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage degree & diploma programs, seat allocations, fees, and merit weights
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all text-xs flex items-center gap-2 self-start sm:self-center"
        >
          <Plus size={16} />
          <span>Add New Program</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Programs List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((prog) => (
          <div
            key={prog.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {prog.category.replace('_', ' ')}
                </span>
                <span className="text-xs font-bold text-secondary">
                  PKR {prog.application_fee?.toLocaleString()}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{prog.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{prog.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-semibold text-slate-700">{prog.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allocated Seats:</span>
                  <span className="font-bold text-primary">{prog.total_seats || 'Open'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Required Docs:</span>
                  <span className="font-semibold text-slate-700">{prog.documents?.length || 0} Files</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => openEditModal(prog)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
              >
                <Edit2 size={14} /> Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Program Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {editingProg ? 'Edit Program' : 'Create New Program'}
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
                  Program Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. BS Nursing (Generic)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="nursing">Nursing</option>
                    <option value="allied_health">Allied Health</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 4 Years"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.total_seats}
                    onChange={(e) => setForm({ ...form, total_seats: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Application Fee (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.application_fee}
                    onChange={(e) => setForm({ ...form, application_fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Eligibility Criteria
                </label>
                <textarea
                  rows={2}
                  value={form.eligibility}
                  onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                  placeholder="e.g. F.Sc Pre-Medical with 50% marks"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description / Scope
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
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
                  {saving ? 'Saving...' : 'Save Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
