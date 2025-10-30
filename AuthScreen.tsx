
import React from 'react';
import { Icon } from './Icon';

interface AuthScreenProps {
    onSignIn: () => void;
    isReady: boolean;
    authError: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSignIn, isReady, authError }) => {
    
    const getButtonText = () => {
        if (authError) return "Configuración Inválida";
        if (isReady) return "Conectar con Google";
        return "Inicializando...";
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center font-sans">
            <div className="text-center p-8 max-w-lg">
                <div className="flex justify-center items-center gap-4 mb-6">
                    <Icon type="bot" className="w-12 h-12 text-blue-400"/>
                    <h1 className="text-4xl font-bold tracking-tight">
                        Asistente <span className="text-blue-400">Claudia</span>
                    </h1>
                </div>
                <p className="text-gray-300 text-lg mb-8">
                    Para comenzar, conecta tu Cuenta de Google. Esto permitirá a Claudia gestionar tus correos, calendario y archivos de forma segura.
                </p>

                {authError && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{authError}</span>
                    </div>
                )}

                <button
                    onClick={onSignIn}
                    disabled={!isReady || !!authError}
                    className="flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl disabled:bg-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
                >
                     <svg className="w-6 h-6" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <g>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                        </g>
                    </svg>
                    {getButtonText()}
                </button>
            </div>
        </div>
    );
};
