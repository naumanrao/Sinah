'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Hero } from '@/components/Hero';
import { Section } from '@/components/Section';
import { Target, Eye, Heart, CheckCircle2 } from 'lucide-react';

const values = [
    {
        title: 'Mission',
        description: 'To provide high-quality education and training to future healthcare professionals, fostering excellence in clinical practice, research, and leadership.',
        icon: <Target className="text-secondary" size={40} />,
    },
    {
        title: 'Vision',
        description: 'To be a premier institute of excellence in nursing and allied health sciences, recognized for producing compassionate and competent healthcare leaders.',
        icon: <Eye className="text-secondary" size={40} />,
    },
    {
        title: 'Values',
        description: 'Integrity, Compassion, Professionalism, and Continuous Learning are the pillars that guide our academic and clinical journey.',
        icon: <Heart className="text-secondary" size={40} />,
    }
];

export default function About() {
    return (
        <div className="flex flex-col">
            <Hero
                title="Dedicated to Excellence in Nursing Education"
                subtitle="SINAH Institute of Nursing & Allied Health Sciences has been at the forefront of providing quality medical education since its inception."
                image="/images/hero.png"
            />

            {/* Institute Overview */}
            <Section
                title="About Our Institute"
                subtitle="Our Legacy"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h3 className="text-3xl font-bold text-primary leading-tight">
                            A Hub for Healthcare Learning and Clinical Mastery
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            SINAH Institute of Nursing & Allied Health Sciences is dedicated to the development of skilled healthcare professionals who are ready to serve the community with competence and compassion. Our curriculum is designed to meet the evolving needs of the healthcare industry, combining academic rigor with extensive clinical experience.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            We believe in creating an environment where students are encouraged to reach their full potential. With state-of-the-art facilities, experienced faculty, and strong hospital partnerships, we provide our students with the best possible platform for their professional growth.
                        </p>
                        <ul className="space-y-4 pt-4">
                            {['PNC Approved Programs', 'Affiliated with Leading Hospitals', 'Expert Academic Guidance', 'State-of-the-art Simulation Labs'].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-primary font-medium">
                                    <CheckCircle2 size={20} className="text-secondary" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative">
                        <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src="/images/nursing.png"
                                alt="Institute Building"
                                fill
                                className="object-cover"
                            />
                        </div>
                        {/* Decorative Overlay */}
                        <div className="absolute -bottom-6 -left-6 bg-medical-gradient p-8 rounded-2xl shadow-xl hidden md:block">
                            <div className="text-white">
                                <p className="text-4xl font-bold">10+</p>
                                <p className="text-sm">Years of Excellence</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Mission Vision Values */}
            <Section
                title="Our Guiding Principles"
                subtitle="Purpose & Direction"
                light
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {values.map((value, index) => (
                        <motion.div
                            key={value.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 text-center"
                        >
                            <div className="mb-6 flex justify-center">{value.icon}</div>
                            <h4 className="text-2xl font-bold text-primary mb-4">{value.title}</h4>
                            <p className="text-muted-foreground leading-relaxed">
                                {value.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* Leadership Message */}
            <Section
                title="Principal's Message"
                subtitle="Words from Leadership"
            >
                <div className="bg-slate-50 p-8 md:p-16 rounded-[3rem] border border-slate-200/50 flex flex-col md:flex-row gap-12 items-center">
                    <div className="w-48 h-48 rounded-full overflow-hidden shrink-0 border-4 border-white shadow-xl">
                        <div className="w-full h-full bg-primary flex items-center justify-center text-white text-4xl font-bold">PR</div>
                    </div>
                    <div className="space-y-6">
                        <p className="text-xl italic text-primary leading-relaxed">
                            "At SINAH, we don't just teach nursing; we cultivate leaders who will shape the future of healthcare. Our commitment to excellence is reflected in the success of our graduates who are making a difference in the lives of patients every day."
                        </p>
                        <div>
                            <h5 className="text-2xl font-bold text-primary">Dr. Sarah Ahmed</h5>
                            <p className="text-secondary font-bold uppercase tracking-wider text-sm">Principal, SINAH Institute</p>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}
