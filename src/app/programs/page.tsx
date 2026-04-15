'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Hero } from '@/components/Hero';
import { Section } from '@/components/Section';
import { Clock, GraduationCap, CheckCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const nursingPrograms = [
    {
        name: 'BS Nursing (Generic)',
        duration: '4 Years + 1 Year Internship',
        eligibility: 'Intermediate (Pre-Medical) with 50% marks',
        scope: 'Professional registered nurse for hospitals and healthcare systems globally.',
        image: '/images/nursing.png',
    },
    {
        name: 'Post RN BSN',
        duration: '2 Years',
        eligibility: '3-year Diploma in General Nursing and 1-year Midwifery',
        scope: 'Advanced clinical practice and leadership roles in specialized nursing.',
        image: '/images/hero.png',
    },
    {
        name: 'Lady Health Visitor (LHV)',
        duration: '2 Years',
        eligibility: 'Metric (Science) with 45% marks',
        scope: 'Community health service and primary care for rural healthcare.',
        image: '/images/allied-health.png',
    },
    {
        name: 'Community Midwifery (CMW)',
        duration: '2 Years',
        eligibility: 'Metric with 45% marks',
        scope: 'Prepares individuals to provide essential maternal and neonatal care.',
        image: '/images/cmw.jpg',
    }
];

const alliedHealth = [
    {
        name: 'Pharmacy Technician',
        duration: '2 Years',
        eligibility: 'Matric (Science)',
        scope: 'Diagnostic laboratories, forensic labs, and medical research.',
        image: '/images/allied-health.png'
    },

];

export default function Programs() {
    return (
        <div className="flex flex-col">
            <Hero
                title="Explore Our Academic Programs"
                subtitle="Choose from a variety of nursing and allied health programs designed to build your future in healthcare."
                image="/images/allied-health.png"
            />

            {/* Nursing Programs */}
            <Section
                title="Nursing Programs"
                subtitle="Leading with Care"
                className="bg-muted/10"
            >
                <div className="space-y-12">
                    {nursingPrograms.map((program, index) => (
                        <motion.div
                            key={program.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col lg:flex-row"
                        >
                            <div className="lg:w-1/3 relative h-64 lg:h-auto">
                                <Image
                                    src={program.image}
                                    alt={program.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-8 lg:p-12 lg:w-2/3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <h3 className="text-3xl font-bold text-primary">{program.name}</h3>
                                    <div className="bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 self-start">
                                        <Clock size={16} /> {program.duration}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-3">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Eligibility</p>
                                        <p className="text-primary font-medium flex items-start gap-2">
                                            <CheckCircle size={18} className="text-secondary mt-1 shrink-0" /> {program.eligibility}
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Professional Scope</p>
                                        <p className="text-muted-foreground">{program.scope}</p>
                                    </div>
                                </div>

                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
                                >
                                    Request More Info <ChevronRight size={18} className="text-secondary" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* Allied Health Programs */}
            <Section
                title="Allied Health Sciences"
                subtitle="Technical Excellence"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {alliedHealth.map((program, index) => (
                        <motion.div
                            key={program.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200/50 group hover:border-secondary/30 transition-all"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0">
                                    <GraduationCap size={28} />
                                </div>
                                <h3 className="text-2xl font-bold text-primary">{program.name}</h3>
                            </div>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                {program.scope}
                            </p>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                                <span className="text-sm font-bold text-primary uppercase">{program.duration}</span>
                                <Link href="/contact" className="text-secondary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Apply Now <ChevronRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Section>
        </div>
    );
}
