'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import { useCity, cities } from '@/context/CityContext';

export function CitySelectionModal() {
    const { isModalOpen, selectCity, closeModal } = useCity();

    return (
        <AnimatePresence>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    // Removed onClick to force selection
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <MapPin size={32} />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your City</h2>
                            <p className="text-gray-500 mb-8">
                                Please select your city to see relevant contact information and campus location.
                            </p>

                            <div className="grid gap-3">
                                {cities.map((city) => (
                                    <button
                                        key={city.id}
                                        onClick={() => selectCity(city.id)}
                                        className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-between group transition-all duration-300"
                                    >
                                        <span className="font-semibold text-gray-700 group-hover:text-primary transition-colors">
                                            {city.name}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                            <MapPin size={16} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
