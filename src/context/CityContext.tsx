'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface City {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    mapUrl: string;
}

export const cities: City[] = [
    {
        id: 'muzaffargarh',
        name: 'Muzaffargarh',
        phone: '+92 307 1669696 | +92 335 6807181',
        email: 'sinahmuzaffargrah@gmail.com',
        address: 'Siddique institute of Nursing and Allied Health Science Muzaffargarh 356Q+7C4, nearby Canal Road, Muzaffargarh, Pakistan',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.1598002318633!2d71.18605457506193!3d30.060953617789252!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393ad993c5477b01%3A0xe7cc129333aa1daf!2sSiddique%20institute%20of%20Nursing%20and%20Allied%20Health%20Science%20Muzaffargarh!5e0!3m2!1sen!2s!4v1773504184487!5m2!1sen!2s'
    },
    {
        id: 'muzaffargarh',
        name: 'Muzaffargarh',
        phone: '+92 307 1669696 | +92 335 6807181',
        email: 'sinahmuzaffargrah@gmail.com',
        address: 'Muzaffargarh City Campus, Main Road, Muzaffargarh',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.1598002318633!2d71.18605457506193!3d30.060953617789252!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393ad993c5477b01%3A0xe7cc129333aa1daf!2sSiddique%20institute%20of%20Nursing%20and%20Allied%20Health%20Science%20Muzaffargarh!5e0!3m2!1sen!2s!4v1773504184487!5m2!1sen!2s'
    }
];

interface CityContextType {
    selectedCity: City;
    selectCity: (cityId: string) => void;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
    const [selectedCity, setSelectedCity] = useState<City>(cities[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const storedCityId = localStorage.getItem('selectedCityId');
        if (storedCityId) {
            const city = cities.find(c => c.id === storedCityId);
            if (city) {
                setSelectedCity(city);
            }
        }
        // Always open modal on load as per user requirement
        setIsModalOpen(true);
        setHasLoaded(true);
    }, []);

    const selectCity = (cityId: string) => {
        const city = cities.find(c => c.id === cityId);
        if (city) {
            setSelectedCity(city);
            localStorage.setItem('selectedCityId', cityId);
            setIsModalOpen(false);
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    if (!hasLoaded) {
        return null; // Or a loading spinner
    }

    return (
        <CityContext.Provider value={{ selectedCity, selectCity, isModalOpen, openModal, closeModal }}>
            {children}
        </CityContext.Provider>
    );
}

export function useCity() {
    const context = useContext(CityContext);
    if (!context) {
        throw new Error('useCity must be used within a CityProvider');
    }
    return context;
}
