'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Calendar,
  CheckCircle,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  Users,
  Building,
  ShieldCheck,
  Download,
  HelpCircle,
  ChevronDown,
  PhoneCall,
  BadgeCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Program {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  duration: string;
  eligibility: string;
  total_seats: number;
  application_fee: number;
  session_id?: string;
  session_title?: string;
}

export default function AdmissionsPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await fetch('/api/programs');
        const data = await res.json();
        if (data.success && data.data) {
          setPrograms(data.data);
        }
      } catch (err) {
        console.error('Failed to load programs', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Create Account',
      desc: 'Register with your active email & phone number to access the student admission portal.',
      icon: Users,
    },
    {
      num: '02',
      title: 'Choose Program & Fill Form',
      desc: 'Select your preferred degree/diploma program and provide your personal & academic details.',
      icon: FileText,
    },
    {
      num: '03',
      title: 'Upload Documents',
      desc: 'Upload clear scans of your CNIC/B-Form, Matric/F.Sc DMC, photographs, and domicile.',
      icon: CheckCircle,
    },
    {
      num: '04',
      title: 'Merit List & Decision',
      desc: 'Track verification, entry test / interview schedule, and merit list status in real-time.',
      icon: Award,
    },
    {
      num: '05',
      title: 'Fee & Confirmation',
      desc: 'Download your official admission offer letter, submit admission fee voucher, and join SINAH.',
      icon: BadgeCheck,
    },
  ];

  const faqs = [
    {
      q: 'Is SINAH Institute recognized and affiliated?',
      a: 'Yes, SINAH Institute is fully recognized by the Pakistan Nursing Council (PNC), affiliated with reputable health universities (NUMS/UHS), and registered with the Pharmacy Council of Pakistan.',
    },
    {
      q: 'What is the minimum eligibility for BS Nursing (Generic)?',
      a: 'Candidates must have passed F.Sc (Pre-Medical) with at least 50% marks in Physics, Chemistry, and Biology. Both male and female candidates between 14 to 35 years of age are eligible.',
    },
    {
      q: 'Can I apply for multiple programs simultaneously?',
      a: 'Yes! Using a single applicant portal account, you can submit separate applications for multiple programs such as BSN, Post RN, or Allied Health programs.',
    },
    {
      q: 'Are hostel and clinical training facilities available?',
      a: 'Yes, SINAH provides separate, secure hostel accommodation for female students along with dedicated transport and direct clinical rotation in 500+ bed tertiary teaching hospitals.',
    },
    {
      q: 'How will I be informed about test dates and merit lists?',
      a: 'All announcements are updated in real-time on your student dashboard. Additionally, SMS and email alerts are dispatched at each stage of the review workflow.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-br from-primary via-primary/95 to-slate-900 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-xs lg:text-sm font-bold uppercase tracking-widest border border-secondary/30 backdrop-blur-md"
            >
              <Sparkles size={14} /> Official Admissions Open • Academic Year 2025-2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
            >
              Shape Your Healthcare Career with <span className="text-secondary">SINAH</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-300 text-base sm:text-lg lg:text-xl font-normal leading-relaxed"
            >
              Join Pakistan&apos;s premier institute for Nursing and Allied Health Sciences. Apply online in 5 easy steps with real-time application tracking.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-4"
            >
              <Link
                href={user ? '/apply' : '/auth/register'}
                className="px-8 py-4 bg-secondary text-primary font-black rounded-2xl shadow-xl shadow-secondary/20 hover:scale-105 hover:bg-secondary/90 transition-all flex items-center gap-2 group"
              >
                <span>Apply Online Now</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/15"
                >
                  My Applications Portal
                </Link>
              )}
            </motion.div>
          </div>

          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto pt-8 border-t border-white/10">
            <div className="text-center p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/5">
              <div className="text-2xl lg:text-3xl font-black text-secondary">PNC</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Recognized Institute</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/5">
              <div className="text-2xl lg:text-3xl font-black text-secondary">100%</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Clinical Rotations</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/5">
              <div className="text-2xl lg:text-3xl font-black text-secondary">500+</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Hospital Bed Affiliations</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/5">
              <div className="text-2xl lg:text-3xl font-black text-secondary">Online</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Digital Paperless Portal</div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Programs Grid */}
      <section className="py-20 lg:py-28 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3.5 py-1.5 rounded-full">
            Degree & Diploma Programs
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary mt-4 tracking-tight">
            Programs Offered for Current Session
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Explore our accredited healthcare programs and choose your specialization.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, idx) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-teal-500/10 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-7">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/5 text-primary">
                      {program.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                      <Clock size={13} />
                      <span>{program.duration}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {program.name}
                  </h3>

                  <p className="text-slate-500 text-sm mt-3 line-clamp-3 leading-relaxed">
                    {program.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Eligibility
                      </div>
                      <div className="text-xs font-semibold text-slate-700 mt-0.5">
                        {program.eligibility}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Total Seats
                        </div>
                        <div className="text-sm font-bold text-primary">
                          {program.total_seats || 'Open'} Seats
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">
                          App Fee
                        </div>
                        <div className="text-sm font-bold text-secondary text-right">
                          PKR {program.application_fee?.toLocaleString() || 'Free'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-7 pt-0">
                  <Link
                    href={`/apply?program=${program.id}`}
                    className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 group-hover:bg-secondary group-hover:text-primary transition-all shadow-md"
                  >
                    <span>Apply for {program.name.split(' ')[0]}</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 5-Step Application Roadmap */}
      <section className="py-20 bg-slate-100/60 border-y border-slate-200/60">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full">
              Seamless Online Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-primary mt-4 tracking-tight">
              How to Complete Your Admission
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Everything from registration to fee verification is handled right here on the portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md flex flex-col justify-between relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-black text-slate-200">{step.num}</span>
                      <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                        <Icon size={20} />
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-2">{step.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Required Documents Checklist */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-100 p-8 lg:p-12 shadow-2xl shadow-slate-200/60 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full">
              Preparation Guide
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-primary">Required Documents Checklist</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Ensure you have digital copies (PDF/JPEG/PNG under 5MB) of these documents ready before starting your online application.
            </p>
            <div className="pt-2">
              <Link
                href={user ? '/apply' : '/auth/register'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/95 transition-all text-sm"
              >
                <span>Start Application</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Passport Size Photograph (Blue Background)',
              'CNIC or B-Form (Applicant)',
              'Father / Guardian CNIC Copy',
              'Matriculation (SSC) DMC / Result Card',
              'F.Sc (HSSC) Pre-Medical DMC (for BSN)',
              'District Domicile Certificate',
              'Valid PNC Registration (Post-RN only)',
              'Original Paid Bank Challan / Voucher',
            ].map((doc, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <CheckCircle className="text-secondary shrink-0 mt-0.5" size={18} />
                <span className="text-xs font-semibold text-slate-700 leading-snug">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-100/60">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1.5 rounded-full">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold text-primary mt-3">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-slate-800 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="p-5 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Helpdesk Callout */}
      <section className="py-16 bg-primary text-white text-center">
        <div className="container mx-auto px-4 max-w-3xl space-y-4">
          <h3 className="text-2xl sm:text-3xl font-bold">Need Help with Your Application?</h3>
          <p className="text-slate-300 text-sm">
            Our admission counselors are available Monday through Saturday (8:00 AM – 4:00 PM) to assist you with eligibility and document queries.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <a
              href="tel:+923071669696"
              className="px-6 py-3 bg-secondary text-primary font-bold rounded-xl inline-flex items-center gap-2 hover:bg-secondary/90 transition-all text-sm"
            >
              <PhoneCall size={16} /> +92 307 1669696
            </a>
            <Link
              href="/contact"
              className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl inline-flex items-center gap-2 hover:bg-white/20 transition-all text-sm"
            >
              Visit Admission Office
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
