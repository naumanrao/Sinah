'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
  GraduationCap
} from 'lucide-react';

interface ApplicationItem {
  id: string;
  reference_number: string;
  full_name: string;
  father_name: string;
  cnic: string;
  phone: string;
  email: string;
  program_name: string;
  session_title: string;
  status: string;
  status_label: string;
  status_color: string;
  created_at: string;
  submitted_at: string;
}

interface StatusOption {
  name: string;
  label: string;
  color: string;
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/applications?search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setApplications(data.data.applications || []);
        setStatuses(data.data.statuses || []);
      }
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Applicant Registry & Dossiers
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Review student admissions, inspect academic qualifications, and transition workflow statuses
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Reference, Name, CNIC, Phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </form>

        <div className="flex items-center gap-3 self-start md:self-center">
          <Filter size={16} className="text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All Application Statuses</option>
            {statuses.map((s) => (
              <option key={s.name} value={s.name}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="text-xs text-slate-400 font-semibold">Loading applicants...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No applications match your search or filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Reference No</th>
                  <th className="p-4">Applicant Name</th>
                  <th className="p-4">CNIC / Contact</th>
                  <th className="p-4">Program & Session</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-primary">{app.reference_number}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{app.full_name}</div>
                      <div className="text-[11px] text-slate-400">S/D of {app.father_name || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>{app.cnic || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400">{app.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{app.program_name}</div>
                      <div className="text-[10px] text-slate-400">{app.session_title}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
                        style={{
                          backgroundColor: `${app.status_color || '#3b82f6'}15`,
                          color: app.status_color || '#3b82f6',
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: app.status_color || '#3b82f6' }} />
                        {app.status_label || app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-[11px]">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="px-3 py-1.5 bg-primary text-white hover:bg-primary/90 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
