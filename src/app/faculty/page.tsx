'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Hero } from '@/components/Hero';
import { Section } from '@/components/Section';
import { Mail, GraduationCap, Award } from 'lucide-react';

const facultyMembers = [
    {
        name: 'Dr. Sarah Ahmed',
        role: 'Principal & Head of Nursing',
        qualification: 'PhD in Nursing, MSc Clinical Nursing',
        experience: '15+ Years',
        initials: 'SA',
    },
    {
        name: 'Prof. Muhammad Usman',
        role: 'Head of Allied Health',
        qualification: 'M.Phil Pathology, MBBS',
        experience: '12+ Years',
        initials: 'MU',
    },
    {
        name: 'Ms. Fatima Zehra',
        role: 'Senior Nursing Instructor',
        qualification: 'MSN, BSc Nursing',
        experience: '8+ Years',
        initials: 'FZ',
    },
    {
        name: 'Dr. Irfan Malik',
        role: 'Senior Faculty (Bio-Sciences)',
        qualification: 'MSc Biochemistry, PhD',
        experience: '10+ Years',
        initials: 'IM',
    }
];

export default function Faculty() {
    return (
        <div className="flex flex-col">
            <Hero
                title="Our Distinguished Faculty"
                subtitle="Learn from the best in the field. Our faculty members bring decades of clinical experience and academic excellence."
                image="/images/hero.png"
            />

            <Section
                title="Academic Leadership"
                subtitle="Meet Our Experts"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {facultyMembers.map((member, index) => (
                        <motion.div
                            key={member.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all"
                        >
                            <div className="h-48 bg-medical-gradient flex items-center justify-center text-white text-5xl font-bold">
                                {member.initials}
                            </div>
                            <div className="p-8">
                                <h3 className="text-xl font-bold text-primary mb-1">{member.name}</h3>
                                <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-4">{member.role}</p>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <GraduationCap size={16} className="text-primary mt-1 shrink-0" />
                                        <span>{member.qualification}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <Award size={16} className="text-primary mt-1 shrink-0" />
                                        <span>{member.experience} Experience</span>
                                    </div>
                                </div>

                                <button className="w-full mt-6 py-3 rounded-xl border-2 border-slate-100 text-primary font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
                                    <Mail size={16} /> Contact Profile
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* Faculty Philosophy */}
            <Section light className="text-center">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h3 className="text-3xl font-bold text-primary">Academic Philosophy</h3>
                    <p className="text-muted-foreground leading-relaxed italic">
                        "We believe in a student-centered approach where mentorship is at the core of education. Our faculty doesn't just deliver lectures; they prepare students for real-world medical challenges through empathy, rigorous practice, and ethical values."
                    </p>
                    <div className="h-1 w-24 bg-secondary mx-auto rounded-full" />
                </div>
            </Section>
        </div>
    );
}
