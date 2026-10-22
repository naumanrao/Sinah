'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Landmark, Mail, Lock, ArrowRight, AlertCircle, Loader2, Sparkles, ShieldCheck, GraduationCap } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await login(email, password);
      if (result.success) {
        if (redirect) {
          router.push(redirect);
        } else {
          // Check role to direct properly
          const meRes = await fetch('/api/auth/me');
          const meData = await meRes.json();
          if (meData.success && meData.data.role !== 'student') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        setError(result.error || 'Invalid email or password.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@sinah.edu.pk');
    setPassword('Admin@12345');
    setError(null);
  };

  const fillDemoStudent = () => {
    setEmail('student@sinah.edu.pk');
    setPassword('Student@12345');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 pt-28 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
        {/* Left Visual Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-primary via-primary/95 to-slate-900 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/40 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:bg-secondary transition-all">
                <Landmark className="text-white" size={26} />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight block">SINAH</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-300 font-semibold">Institute of Nursing</span>
              </div>
            </Link>

            <div className="space-y-4 my-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-secondary/30">
                <Sparkles size={12} /> Admissions Portal
              </span>
              <h2 className="text-3xl font-bold leading-tight">Welcome Back to Your Academic Journey</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Log in to track your admission application, upload documents, check merit lists, or manage institutional operations.
              </p>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 pt-6 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <ShieldCheck className="text-secondary shrink-0" size={18} />
              <span>Secure PNC-Accredited Admission System</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <GraduationCap className="text-secondary shrink-0" size={18} />
              <span>BSN, Post-RN, LHV & Allied Health Programs</span>
            </div>
          </div>
        </div>

        {/* Right Login Form Panel */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Sign In to Your Account</h1>
            <p className="text-slate-500 text-sm mt-1">Enter your registered email and password below</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-sm"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-primary font-bold hover:underline">
                Create Account
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fillDemoStudent}
                className="text-[11px] font-semibold text-primary hover:underline bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20"
              >
                Fill Demo Student
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="text-[11px] font-semibold text-secondary hover:underline bg-secondary/5 px-2.5 py-1 rounded-lg border border-secondary/20"
              >
                Fill Demo Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
      <LoginFormContent />
    </Suspense>
  );
}
