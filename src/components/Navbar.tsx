'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Programs', href: '/programs' },
    { name: 'Faculty', href: '/faculty' },
    { name: 'Contact', href: '/contact' },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                <div className="hidden md:flex items-center space-x-8">
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
                    <Link
                        href="/contact"
                        className="bg-primary text-white lg:px-6 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105"
                    >
                        Apply Now
                    </Link>
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
                            <Link
                                href="/contact"
                                className="bg-primary text-white px-6 py-3 rounded-xl text-center font-medium shadow-xl shadow-primary/20"
                                onClick={() => setIsOpen(false)}
                            >
                                Apply Now
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
