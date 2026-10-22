'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Landmark, User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Programs', href: '/programs' },
    { name: 'Admissions', href: '/admissions' },
    // { name: 'Faculty', href: '/faculty' },
    { name: 'Contact', href: '/contact' },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setUserMenuOpen(false);
        if (userMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [userMenuOpen]);

    const isAdmin = user && user.role !== 'student';

    return (
        <nav
            className={cn(
                'fixed top-0 w-full z-50 transition-all duration-300 border-b',
                scrolled
                    ? 'bg-white backdrop-blur-md border-border py-2'
                    : 'bg-transparent border-transparent py-4'
            )}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2 group shrink-0">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white group-hover:bg-secondary transition-colors shrink-0">
                        <Landmark size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-primary font-sans">SINAH</span>
                        <span className="hidden xs:block text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground leading-none">Institute of Nursing</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'text-sm font-semibold transition-colors hover:text-primary relative',
                                pathname === item.href ? 'text-secondary' : 'text-secondary '
                            )}
                        >
                            {item.name}
                            {pathname === item.href && (
                                <motion.div
                                    layoutId="nav-underline"
                                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-secondary"
                                />
                            )}
                        </Link>
                    ))}

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }}
                                className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-full text-sm font-semibold text-primary transition-all"
                            >
                                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {user.full_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden lg:inline max-w-[100px] truncate">{user.full_name.split(' ')[0]}</span>
                                <ChevronDown size={14} className={cn('transition-transform', userMenuOpen && 'rotate-180')} />
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="p-4 border-b border-slate-100">
                                            <p className="font-bold text-primary text-sm truncate">{user.full_name}</p>
                                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="p-2">
                                            {user.role === 'student' && (
                                                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-primary/5 rounded-xl transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}>
                                                    <LayoutDashboard size={16} className="text-primary" /> My Dashboard
                                                </Link>
                                            )}
                                            {isAdmin && (
                                                <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-primary/5 rounded-xl transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}>
                                                    <LayoutDashboard size={16} className="text-primary" /> Admin Dashboard
                                                </Link>
                                            )}
                                            <button onClick={() => { logout(); setUserMenuOpen(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                                <LogOut size={16} /> Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/auth/login"
                                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors px-3 py-2"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/admissions"
                                className="bg-primary text-white lg:px-6 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105"
                            >
                                Apply Now
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-muted-foreground"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-border overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-8 flex flex-col space-y-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'text-lg font-medium',
                                        pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {user ? (
                                <>
                                    <div className="border-t border-slate-100 pt-4">
                                        <p className="text-sm font-bold text-primary">{user.full_name}</p>
                                        <p className="text-xs text-slate-400">{user.email}</p>
                                    </div>
                                    {user.role === 'student' ? (
                                        <Link href="/dashboard" className="text-lg font-medium text-primary" onClick={() => setIsOpen(false)}>
                                            My Dashboard
                                        </Link>
                                    ) : (
                                        <Link href="/admin" className="text-lg font-medium text-primary" onClick={() => setIsOpen(false)}>
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button onClick={() => { logout(); setIsOpen(false); }}
                                        className="text-left text-lg font-medium text-red-500">
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login" className="text-lg font-medium text-primary" onClick={() => setIsOpen(false)}>
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/admissions"
                                        className="bg-primary text-white px-6 py-3 rounded-xl text-center font-medium shadow-xl shadow-primary/20"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Apply Now
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
