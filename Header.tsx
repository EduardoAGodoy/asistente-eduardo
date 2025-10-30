import React from 'react';
import { Icon } from './Icon';

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
    return (
        <header className="bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Icon type="bot" className="w-8 h-8 text-blue-400"/>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Asistente <span className="text-blue-400">Claudia</span>
                    </h1>
                </div>
            </div>
        </header>
    );
};
