'use client';

import { useState, useRef, useEffect } from 'react';

interface Country {
    code: string;
    name: string;
}

const COUNTRIES: Country[] = [
    { code: 'ES', name: 'España' },
    { code: 'MX', name: 'México' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CL', name: 'Chile' },
    { code: 'PE', name: 'Perú' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'CU', name: 'Cuba' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'DO', name: 'Rep. Dominicana' },
    { code: 'HN', name: 'Honduras' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'PA', name: 'Panamá' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'PR', name: 'Puerto Rico' },
];

interface CountrySelectProps {
    value: string;
    onChange: (code: string) => void;
    className?: string;
}

export default function CountrySelect({ value, onChange, className = '' }: CountrySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className={`relative ${className}`}>
            {/* Selected value button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-sm text-white hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
                <div className="flex items-center gap-3">
                    <img
                        src={`https://flagcdn.com/24x18/${selected.code.toLowerCase()}.png`}
                        alt={selected.name}
                        className="w-6 h-4 object-cover rounded-sm shadow-sm"
                    />
                    <span>{selected.name}</span>
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                    {COUNTRIES.map((country) => (
                        <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                                onChange(country.code);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${country.code === value
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            <img
                                src={`https://flagcdn.com/24x18/${country.code.toLowerCase()}.png`}
                                alt={country.name}
                                className="w-6 h-4 object-cover rounded-sm shadow-sm"
                            />
                            <span>{country.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Export countries list for use elsewhere
export { COUNTRIES };
