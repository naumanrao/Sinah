'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  Loader2,
  Calendar,
  Sparkles,
  ExternalLink,
  CreditCard,
  Building,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface Application {
  id: string;
  reference_number: string;
  status: string;
  status_label?: string;
  status_color?: string;
  program_name: string;
  program_category: string;
  session_title: string;
  created_at: string;
  submitted_at: string | null;
  student_message: string | null;
  fee_status?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  is_read: number;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [appRes, notifRes] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/notifications'),
        ]);

        const appData = await appRes.json();
        const notifData = await notifRes.json();

        if (appData.success) {
          setApplications(Array.isArray(appData.data) ? appData.data : (appData.data?.applications || []));
        }
        if (notifData.success) {
          setNotifications(Array.isArray(notifData.data) ? notifData.data : (notifData.data?.notifications || []));
        }
      } catch (err) {
        console.error('Error fetching dashboard', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user) {
      loadDashboard();
    } else if (!authLoading && !user) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-slate-500 font-semibold text-sm">Loading Applicant Portal...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string, label?: string, color?: string) => {
    const displayLabel = label || status.replace('_', ' ').toUpperCase();
    const styleColor = color || '#3b82f6';

    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm"
        style={{
          backgroundColor: `${styleColor}15`,
          color: styleColor,
          border: `1px solid ${styleColor}30`,
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: styleColor }} />
        {displayLabel}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary via-primary/95 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-primary/10 relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-secondary/30">
                <Sparkles size={12} /> Student Admission Portal
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Welcome, {user?.full_name}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
                Track your admission progress, upload required documents, and view official admission decisions.
              </p>
            </div>

            <Link
              href="/apply"
              className="px-6 py-3.5 bg-secondary text-primary font-bold rounded-2xl shadow-lg shadow-secondary/20 hover:scale-105 hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 self-start md:self-center shrink-0"
            >
              <PlusCircle size={18} />
              <span>Apply for New Program</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column: Applications List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Your Applications</h2>
              <span className="text-xs font-semibold text-slate-500">
                Total: {applications.length}
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">No Applications Started Yet</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                    You haven&apos;t started an application for the current academic session. Explore our accredited programs and apply online today.
                  </p>
                </div>
                <Link
                  href="/admissions"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-primary/95 transition-all"
                >
                  <span>Explore Programs & Apply</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {app.program_category?.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-mono font-bold text-primary">
                            {app.reference_number}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                          {app.program_name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Session: {app.session_title}
                        </p>
                      </div>

                      <div>{getStatusBadge(app.status, app.status_label, app.status_color)}</div>
                    </div>

                    {app.student_message && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-800 text-xs">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <strong>Message from Admission Office:</strong> {app.student_message}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="text-slate-500">
                        {app.submitted_at ? (
                          <span>Submitted on: {new Date(app.submitted_at).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-amber-600 font-semibold">Draft in Progress</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {app.status === 'draft' ? (
                          <Link
                            href={`/apply?appId=${app.id}&program=${app.program_name}`}
                            className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all text-xs flex items-center gap-1.5"
                          >
                            <span>Resume Form</span>
                            <ArrowRight size={14} />
                          </Link>
                        ) : (
                          <Link
                            href={`/dashboard/applications/${app.id}`}
                            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-xs flex items-center gap-1.5"
                          >
                            <span>View Dossier & Track Status</span>
                            <ArrowRight size={14} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Column: Notifications & Help */}
          <div className="lg:col-span-4 space-y-6">
            {/* Notifications Box */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-primary" />
                  <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                </div>
                {Array.isArray(notifications) && notifications.length > 0 && (
                  <span className="text-[10px] font-bold bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </div>

              {!Array.isArray(notifications) || notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No new notifications.</p>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(notifications) ? notifications : []).slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1"
                    >
                      <div className="font-bold text-slate-800">{notif.title}</div>
                      <div className="text-slate-500 text-[11px] leading-relaxed">{notif.message}</div>
                      <div className="text-[10px] text-slate-400 pt-1">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Helpline Box */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl border border-teal-100 p-6 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/70 px-2.5 py-1 rounded-full">
                Admission Support
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Have Questions?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contact our admission helpline for inquiries regarding verification, eligibility, and merit lists.
              </p>
              <div className="pt-2 text-xs font-bold text-primary space-y-1">
                <div>📞 Helpline: +92 307 1669696</div>
                <div>✉️ Email: info@sinah.edu.pk</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
