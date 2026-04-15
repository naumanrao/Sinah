

'use client';

import React from 'react';
import Link from 'next/link';
import { Landmark, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';
import { useCity } from '@/context/CityContext';

export function Footer() {
    const { selectedCity, openModal } = useCity();

    return (
        <footer className="bg-primary text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary">
                                <Landmark size={24} />
                            </div>
                            <span className="text-xl font-bold tracking-tight">SINAH</span>
                        </Link>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Excellence in Nursing & Allied Health Sciences. Empowering the next generation of healthcare professionals with quality education and clinical training.
                        </p>
                        {/* <div className="flex space-x-4">
                            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-secondary transition-colors"><Facebook size={18} /></a>
                            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-secondary transition-colors"><Twitter size={18} /></a>
                            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-secondary transition-colors"><Instagram size={18} /></a>
                            <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-secondary transition-colors"><Linkedin size={18} /></a>
                        </div> */}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-4 text-sm text-white/70">
                            <li><Link href="/about" className="hover:text-secondary transition-colors">About Institute</Link></li>
                            <li><Link href="/programs" className="hover:text-secondary transition-colors">Academic Programs</Link></li>
                            <li><Link href="/faculty" className="hover:text-secondary transition-colors">Our Faculty</Link></li>
                            <li><Link href="/contact" className="hover:text-secondary transition-colors">Admissions</Link></li>
                        </ul>
                    </div>

                    {/* Programs */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Programs</h3>
                        <ul className="space-y-4 text-sm text-white/70">
                            <li><Link href="/programs" className="hover:text-secondary transition-colors">Nursing (BSN)</Link></li>
                            <li><Link href="/programs" className="hover:text-secondary transition-colors">Post RN BSN</Link></li>
                            <li><Link href="/programs" className="hover:text-secondary transition-colors">Lady Health Visitor</Link></li>
                            <li><Link href="/programs" className="hover:text-secondary transition-colors">Community Midwifery (CMW)</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Contact Us</h3>
                        <ul className="space-y-4 text-sm text-white/70">
                            <li className="flex items-start space-x-3">
                                <MapPin size={18} className="text-secondary shrink-0" />
                                <span>{selectedCity.address}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone size={18} className="text-secondary shrink-0" />
                                <span>{selectedCity.phone}</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail size={18} className="text-secondary shrink-0" />
                                <span>{selectedCity.email}</span>
                            </li>
                            {/* <li className="pt-2">
                                <button
                                    onClick={openModal}
                                    className="flex items-center space-x-2 text-secondary hover:text-white transition-colors text-sm font-semibold border border-secondary/30 rounded-full px-4 py-2 hover:bg-secondary/10"
                                >
                                    <Globe size={16} />
                                    <span>Change Location ({selectedCity.name})</span>
                                </button>
                            </li> */}

                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 text-center text-sm text-white/50">
                    <p>© {new Date().getFullYear()} SINAH Institute of Nursing & Allied Health Sciences. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
