'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeroProps {
    title: string;
    subtitle: string;
    image: string;
    height?: 'small' | 'medium' | 'large';
    children?: React.ReactNode;
}

export function Hero({ title, subtitle, image, height = 'medium', children }: HeroProps) {
    const heights = {
        small: 'min-h-[300px] md:min-h-[40vh]',
        medium: 'min-h-[400px] md:min-h-[60vh]',
        large: 'min-h-[500px] md:min-h-[85vh]',
    };

    return (
        <section className={cn('relative w-full overflow-hidden flex items-center', heights[height])}>
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-hero-overlay opacity-90" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1]"
                    >
                        {title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-base md:text-lg lg:text-xl text-white/90 mb-8 leading-relaxed"
                    >
                        {subtitle}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </div>

            {/* Decorative Blob */}
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </section>
    );
}
