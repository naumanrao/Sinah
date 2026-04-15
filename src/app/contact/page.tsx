'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hero } from '@/components/Hero';
import { Section } from '@/components/Section';
import { Phone, Mail, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { useCity } from '@/context/CityContext';

export default function Contact() {
    const [formState, setFormState] = useState({ name: '', email: '', program: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const { selectedCity } = useCity();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <div className="flex flex-col">
            <Hero
                title="Contact Our Admissions Office"
                subtitle="Have questions about our programs or admissions? We're here to help you start your journey in healthcare."
                image="/images/hero.png"
            />

            <Section
                title="Get in Touch"
                subtitle="We're Here for You"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div>
                            <h3 className="text-3xl font-bold text-primary mb-6">Institute Contact Information</h3>
                            <p className="text-muted-foreground leading-relaxed mb-8">
                                Our admissions office is open Monday to Friday, 9:00 AM to 5:00 PM. Feel free to visit us or reach out through any of the following channels.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary">Phone</p>
                                            <p className="text-muted-foreground">{selectedCity.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary">Email</p>
                                            <p className="text-muted-foreground">{selectedCity.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary">Address</p>
                                            <p className="text-muted-foreground">{selectedCity.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary">Hours</p>
                                            <p className="text-muted-foreground">Mon - Fri, 9AM - 5PM</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                    {/* Google Map */}
                    <div className="w-full h-80 bg-slate-100 rounded-[2rem] border border-slate-200 overflow-hidden relative shadow-inner">
                        <iframe
                            src={selectedCity.mapUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`${selectedCity.name} Campus Location`}
                            className="grayscale hover:grayscale-0 transition-all duration-700"
                        ></iframe>
                    </div>
                    {/* Contact Form */}
                    {/* <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative">
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <Send size={40} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-primary">Inquiry Sent Successfully!</h4>
                                    <p className="text-muted-foreground mt-2">Thank you for reaching out. Our team will contact you shortly.</p>
                                </div>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="text-primary font-bold underline"
                                >
                                    Send another message
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                                        <MessageSquare size={24} />
                                    </div>
                                    <h4 className="text-2xl font-bold text-primary">Send an Inquiry</h4>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-primary px-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                        placeholder="Enter your name"
                                        value={formState.name}
                                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-primary px-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                        placeholder="name@example.com"
                                        value={formState.email}
                                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-primary px-1">Selected Program</label>
                                    <select
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all appearance-none"
                                        value={formState.program}
                                        onChange={(e) => setFormState({ ...formState, program: e.target.value })}
                                    >
                                        <option value="">Select a program</option>
                                        <option value="bsn">BS Nursing (Generic)</option>
                                        <option value="post-rn">Post RN BSN</option>
                                        <option value="lhv">Lady Health Visitor (LHV)</option>
                                        <option value="mlt">Medical Lab Technology</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-primary px-1">Your Message</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all resize-none"
                                        placeholder="How can we help you?"
                                        value={formState.message}
                                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    Submit Admission Inquiry <Send size={20} />
                                </button>
                            </form>
                        )}
                    </div> */}
                </div>
            </Section>
        </div>
    );
}
