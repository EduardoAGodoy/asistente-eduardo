
import React from 'react';
import type { Project } from '../types';
import { Icon } from './Icon';

interface ProjectsPanelProps {
    projects: Project[];
}

export const ProjectsPanel: React.FC<ProjectsPanelProps> = ({ projects }) => {
    
    const handleExport = () => {
        // Mock export functionality
        alert("Función de exportar proyectos no implementada en esta demostración.");
        console.log("Exporting projects:", projects);
    };

    const handleImport = () => {
        // Mock import functionality
        alert("Función de importar proyectos no implementada en esta demostración.");
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl p-4 flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-200 mb-4 border-b border-gray-700 pb-2">Proyectos</h3>
            <div className="flex-grow space-y-3 overflow-y-auto pr-2">
                {projects.map(project => (
                    <div key={project.id} className="bg-gray-700 p-3 rounded-lg">
                        <p className="font-semibold text-white">{project.name}</p>
                        <p className="text-sm text-gray-400">{project.description}</p>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col space-y-2">
                <button 
                    onClick={handleExport}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    <Icon type="download" className="w-5 h-5"/>
                    Exportar
                </button>
                <button 
                    onClick={handleImport}
                    className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    <Icon type="upload" className="w-5 h-5"/>
                    Importar
                </button>
            </div>
        </div>
    );
};
