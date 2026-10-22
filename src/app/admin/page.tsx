'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  FileCheck,
  Award,
  Calendar,
  GraduationCap,
  ArrowRight,
  Loader2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface DashboardData {
  totalApplications: number;
  byStatus: { status: string; label: string; color: string; count: number }[];
  byProgram: { id: string; name: string; category: string; count: number }[];
  recentApplications: {
    id: string;
    reference_number: string;
    full_name: string;
    program_name: string;
    status: string;
    created_at: string;
  }[];
  activeSession: {
    id: string;
    title: string;
    academic_year: string;
    status: string;
  } | null;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/dashboard');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-slate-500 text-xs font-semibold">Loading Admin Dashboard...</p>
      </div>
    );
  }

  const getStatusCount = (statusName: string) => {
    return data?.byStatus?.find((s) => s.status === statusName)?.count || 0;
  };

  const submittedCount = getStatusCount('submitted');
  const reviewCount = getStatusCount('under_review') + getStatusCount('documents_required');
  const selectedCount = getStatusCount('selected') + getStatusCount('admission_offered');
  const confirmedCount = getStatusCount('confirmed');

  return (
    <div className="space-y-8">
      {/* Top Welcome & Session Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admissions Overview
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time applicant metrics and admission workflow pipeline
          </p>
        </div>

        {data?.activeSession && (
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <Calendar size={18} className="text-secondary shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Session</span>
              <span className="font-bold text-slate-800">{data.activeSession.title}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">
              {data.activeSession.status}
            </span>
          </div>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Applicants</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{data?.totalApplications || 0}</div>
          <div className="text-[11px] text-slate-500 font-medium">All registered application dossiers</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Under Review</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-700">{submittedCount + reviewCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Awaiting document check or test</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Merit / Selected</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700">{selectedCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Offered admission seats</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirmed Enrolled</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-teal-700">{confirmedCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">Fee verified & admission finalized</div>
        </div>
      </div>

      {/* Program Breakdown & Fast Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Applications by Program */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Applications by Program</h2>
            <Link href="/admin/programs" className="text-xs font-bold text-primary hover:underline">
              Manage Programs →
            </Link>
          </div>

          <div className="space-y-4">
            {data?.byProgram && data.byProgram.length > 0 ? (
              data.byProgram.map((prog, idx) => {
                const total = data.totalApplications || 1;
                const pct = Math.round(((prog.count || 0) / total) * 100);

                return (
                  <div key={prog.id || prog.name || idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{prog.name}</span>
                      <span className="text-slate-500 font-semibold">
                        {prog.count || 0} applicants ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4">No program application data yet.</p>
            )}
          </div>
        </div>

        {/* Quick Operations Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-primary to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg shadow-primary/10 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-secondary bg-secondary/20 px-3 py-1 rounded-full border border-secondary/30">
              Quick Shortcuts
            </span>
            <h3 className="text-xl font-bold">Admission Management Tools</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Verify pending documents, review applicant academic marks, and update admission decisions.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <Link
              href="/admin/applications"
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
            >
              <span>View All Applications</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/admin/documents"
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
            >
              <span>Document Verification Queue</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/admin/sessions"
              className="w-full py-3 px-4 bg-secondary text-primary hover:bg-secondary/90 rounded-xl text-xs font-black transition-all flex items-center justify-between shadow-md"
            >
              <span>Manage Admission Sessions</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Applications Received</h2>
            <p className="text-slate-500 text-xs mt-0.5">Latest applicant dossiers submitted online</p>
          </div>
          <Link href="/admin/applications" className="text-xs font-bold text-primary hover:underline">
            View Full Registry →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Ref Number</th>
                <th className="p-3.5">Applicant Name</th>
                <th className="p-3.5">Program</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentApplications && data.recentApplications.length > 0 ? (
                data.recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-primary">{app.reference_number}</td>
                    <td className="p-3.5 font-bold text-slate-800">{app.full_name}</td>
                    <td className="p-3.5 text-slate-600">{app.program_name}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary font-bold rounded-lg text-xs transition-colors"
                      >
                        Review Dossier
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No applications received yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
