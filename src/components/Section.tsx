'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    id?: string;
    light?: boolean;
}

export function Section({ children, title, subtitle, className, id, light = false }: SectionProps) {
    return (
        <section
            id={id}
            className={cn(
                'py-20 px-4 overflow-hidden',
                light ? 'bg-muted/30' : 'bg-background',
                className
            )}
        >
            <div className="container mx-auto">
                {(title || subtitle) && (
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        {subtitle && (
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-secondary font-bold text-sm uppercase tracking-widest mb-3 block"
                            >
                                {subtitle}
                            </motion.span>
                        )}
                        {title && (
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl md:text-4xl font-bold text-primary"
                            >
                                {title}
                            </motion.h2>
                        )}
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: 60 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="h-1 bg-secondary mx-auto mt-4 rounded-full"
                        />
                    </div>
                )}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </div>
        </section>
    );
}
