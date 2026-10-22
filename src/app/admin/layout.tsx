'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  Users,
  FileCheck,
  Award,
  UserCheck,
  LogOut,
  ChevronRight,
  Landmark,
  Menu,
  X,
  Shield,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role === 'student')) {
      router.push('/auth/login?redirect=/admin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Loader2 className="animate-spin text-secondary" size={36} />
      </div>
    );
  }

  if (!user || user.role === 'student') {
    return null;
  }

  const navLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Admission Sessions', href: '/admin/sessions', icon: Calendar },
    { name: 'Programs & Criteria', href: '/admin/programs', icon: GraduationCap },
    { name: 'Applications Registry', href: '/admin/applications', icon: Users },
    { name: 'Document Verification', href: '/admin/documents', icon: FileCheck },
    { name: 'Staff & Roles', href: '/admin/users', icon: UserCheck, roleReq: 'super_admin' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-secondary text-primary rounded-lg flex items-center justify-center font-bold">
            <Landmark size={18} />
          </div>
          <span className="font-bold text-sm">SINAH Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          {/* Logo & Header */}
          <div className="p-6 border-b border-slate-800">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary text-primary rounded-xl flex items-center justify-center font-black shadow-lg">
                <Landmark size={22} />
              </div>
              <div>
                <div className="text-white font-black text-lg leading-none">SINAH</div>
                <div className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-1">
                  Admission Control
                </div>
              </div>
            </Link>
          </div>

          {/* Current Staff Role Badge */}
          <div className="p-4 mx-4 mt-4 bg-slate-800/80 rounded-2xl border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Shield size={14} className="text-secondary" />
              <span>{user.full_name}</span>
            </div>
            <div className="text-[10px] text-secondary font-semibold uppercase tracking-wider mt-0.5">
              {user.role.replace('_', ' ')}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 mt-2">
            {navLinks.map((item) => {
              if (item.roleReq && user.role !== item.roleReq) return null;
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all',
                    isActive
                      ? 'bg-secondary text-primary shadow-lg shadow-secondary/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span>View Public Website</span>
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
