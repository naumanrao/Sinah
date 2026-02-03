'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Hero } from '@/components/Hero';
import { Section } from '@/components/Section';
import { BookOpen, Award, Users, ShieldCheck, ChevronRight, Stethoscope, Microscope, Activity, Heart, Building2 } from 'lucide-react';
import React from 'react';
import { Counter } from '@/components/Counter';

const programs = [
  {
    title: 'Nursing (BSN)',
    description: 'A 4-year degree program providing comprehensive knowledge and skills in nursing practice and research.',
    image: '/images/nursing.png',
    icon: <Stethoscope size={24} />,
    duration: '4 Years',
  },
  {
    title: 'Allied Health Sciences',
    description: 'Specialized programs in laboratory technology and diagnostics to support the medical field.',
    image: '/images/allied-health.png',
    icon: <Microscope size={24} />,
    duration: '2-4 Years',
  }
];

const features = [
  {
    title: 'Modern Labs',
    description: 'Fully equipped clinical simulation and diagnostic laboratories for hands-on experience.',
    icon: <BookOpen size={32} />,
  },
  {
    title: 'Expert Faculty',
    description: 'Learn from highly qualified educators and experienced clinical professionals.',
    icon: <Users size={32} />,
  },
  {
    title: 'Clinical Rotations',
    description: 'Direct exposure to patient care through partnerships with leading hospitals.',
    icon: <ShieldCheck size={32} />,
  },
  {
    title: 'Academic Excellence',
    description: 'Rigorous curriculum designed to meet international nursing standards.',
    icon: <Award size={32} />,
  }
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Hero
        title="Empowering the Next Generation of Healthcare Leaders"
        subtitle="Join SINAH Institute of Nursing & Allied Health Sciences and embark on a rewarding career in the medical field with world-class education and training."
        image="/images/hero.png"
        height="large"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/contact"
            className="bg-primary text-white text-center px-8 py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            Apply Now <ChevronRight size={20} />
          </Link>
          <Link
            href="/programs"
            className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-center px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center"
          >
            Explore Programs
          </Link>
        </div>
      </Hero>

      {/* Programs Overview */}
      <Section
        title="Our Academic Programs"
        subtitle="Future-Ready Education"
        className="bg-muted/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              <div className="aspect-[16/9] relative overflow-hidden">
                <Image
                  src={program.image}
                  alt={program.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center gap-1">
                  <Award size={14} className="text-secondary" /> {program.duration}
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/5 rounded-2xl text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    {program.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-primary">{program.title}</h3>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {program.description}
                </p>
                <Link
                  href="/programs"
                  className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all"
                >
                  Learn More <ChevronRight size={18} className="text-secondary" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Why Choose Us */}
      <Section
        title="Why Choose SINAH Institute?"
        subtitle="Excellence in Every Step"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-200/20 hover:border-secondary/30 transition-colors text-center"
            >
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-secondary">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold mb-3 text-primary">{feature.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Affiliated Hospital Section */}
      <Section
        title="Our Affiliated Teaching Hospital"
        subtitle="Real-World Clinical Experience"
        className="bg-muted/5"
      >
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-bold text-sm mb-6">
              <Building2 size={18} /> Siddique Hospital
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">
              A Living Classroom for Future Healthcare Professionals
            </h3>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              A unique feature of SINAH Institute is its attached teaching hospital—<span className="text-primary font-bold">Siddique Hospital</span>. It's more than just a training site; it's where students observe, interact, and apply their learning to real patient cases under expert supervision.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/5 rounded-lg text-primary mt-1">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-primary">PHC Licensed</h5>
                  <p className="text-sm text-muted-foreground">200-bedded facility licensed up to 2030</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/5 rounded-lg text-primary mt-1">
                  <Activity size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-primary">Advanced Units</h5>
                  <p className="text-sm text-muted-foreground">ICUs, Dialysis, OT & Emergency</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/5 rounded-lg text-primary mt-1">
                  <Microscope size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-primary">Modern Labs</h5>
                  <p className="text-sm text-muted-foreground">State-of-the-art Radiology & Imaging</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/5 rounded-lg text-primary mt-1">
                  <Heart size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-primary">Specialized Care</h5>
                  <p className="text-sm text-muted-foreground">Maternal & Child Health focus</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 italic text-slate-600">
              "For students, this hospital is a hub of practical training, internships, and research projects, providing direct exposure to chronic disease management and preventive medicine."
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full"
          >
            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl group">
              <Image
                src="/images/siddique-hospital.png"
                alt="Siddique Hospital Exterior"
                fill
                className="object-cover blur-[2px] transition-all duration-700 group-hover:blur-0 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/95 via-primary/60 to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 right-6 p-6 backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl">
                <p className="text-white font-medium">
                  Students during their clinical rotation at Siddique Hospital, gaining hands-on experience in patient care.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>
      {/* Achievements Section with Background Image */}
      <div className="relative py-28 overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/achievements-bg.png"
            alt="Achievements Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-secondary/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]" />
        </div>

        <div className="container mx-auto relative z-10 px-4">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-secondary font-bold text-sm uppercase tracking-widest mb-3 block"
            >
              Success in Numbers
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Our Achievements
            </motion.h2>
            <div className="w-20 h-1.5 bg-secondary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'OF RECENT GRADUATES STARTED NEW JOB', value: 92, suffix: '%', icon: <Users size={32} /> },
              { label: 'PROGRAMS AVAILABLE FOR THE STUDENTS', value: 9, suffix: '+', icon: <BookOpen size={32} /> },
              { label: 'YEARS OF GLORIOUS HISTORY', value: 15, suffix: '+', icon: <Award size={32} /> },
              { label: 'CAMPUS ALL OVER', value: 2, suffix: '+', icon: <Building2 size={32} /> },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center group hover:bg-white/20 transition-all duration-300 shadow-2xl"
              >
                <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-secondary group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-5xl font-black text-white mb-2 tracking-tighter">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white/80 font-bold text-xs tracking-widest uppercase leading-tight">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <footer className="relative bg-medical-gradient py-24 px-4 overflow-hidden -mb-1">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/20 backdrop-blur-[2px]" />
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">Start Your Medical Career Today</h2>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Admissions for the upcoming session are now open. Don't miss your chance to be part of Pakistan's finest nursing community.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link
                  href="/contact"
                  className="bg-white text-primary px-10 py-4 rounded-xl font-bold hover:bg-secondary transition-all shadow-2xl text-center"
                >
                  Apply for Admission
                </Link>
                <Link
                  href="/contact"
                  className="bg-transparent border-2 border-white/50 text-white px-10 py-4 rounded-xl font-bold hover:bg-white/10 transition-all text-center"
                >
                  Consult with Counselor
                </Link>
              </div>
            </div>

            {/* Google Map Embed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full h-[400px] bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 overflow-hidden shadow-2xl"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3446.767216105776!2d71.48686597436544!3d30.243714109104076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393b359162c9378b%3A0xd60a344e2cb018b1!2sSiddique%20Institute%20of%20Nursing%20and%20Allied%20health%20sciences%20Multan!5e0!3m2!1sen!2s!4v1706692224677!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Siddique Institute of Nursing Location"
                className="grayscale hover:grayscale-0 transition-all duration-700 opacity-90 hover:opacity-100"
              ></iframe>
            </motion.div>
          </div>
        </div>

        {/* Decorative Graphic */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary/20 rounded-full blur-2xl" />
      </footer>
    </div>
  );
}
