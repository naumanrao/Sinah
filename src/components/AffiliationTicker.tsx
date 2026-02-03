'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award } from 'lucide-react';

const affiliations = [
    { text: 'Affiliated with Pakistan Nursing Council', icon: <ShieldCheck className="text-secondary" size={20} /> },
    { text: 'Affiliated with Pakistan Pharmacy Council', icon: <Award className="text-secondary" size={20} /> },
    { text: 'Recognized by Higher Education Commission', icon: <ShieldCheck className="text-secondary" size={20} /> },
    { text: 'Registered with Health Care Commission', icon: <Award className="text-secondary" size={20} /> },
];

export const AffiliationTicker = () => {
    // Triple the items to ensure a seamless loop
    const displayItems = [...affiliations, ...affiliations, ...affiliations];

    return (
        <div className="bg-white border-y border-slate-100 py-6 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

            <motion.div
                className="flex whitespace-nowrap gap-12 items-center"
                animate={{
                    x: [0, -1000],
                }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: 'loop',
                        duration: 30,
                        ease: 'linear',
                    },
                }}
            >
                {displayItems.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 px-6 py-2 rounded-full bg-slate-50 border border-slate-100 shadow-sm"
                    >
                        {item.icon}
                        <span className="text-primary font-bold tracking-tight uppercase text-xs sm:text-sm">
                            {item.text}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};
