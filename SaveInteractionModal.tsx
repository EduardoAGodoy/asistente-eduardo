
import React from 'react';

interface SaveInteractionModalProps {
    onClose: (save: boolean) => void;
}

export const SaveInteractionModal: React.FC<SaveInteractionModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
                <h2 className="text-xl font-bold text-white mb-4">Fin de la Interacción</h2>
                <p className="text-gray-300 mb-6">¿Deseas guardar esta conversación?</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => onClose(false)}
                        className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={() => onClose(true)}
                        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};
