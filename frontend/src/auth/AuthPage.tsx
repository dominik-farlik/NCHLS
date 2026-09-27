import React from 'react';
import Navbar from "../components/Navbar.tsx";

interface AuthFormProps {
    children: React.ReactNode;
    title: string;
}

export default function AuthPage({ children, title }: AuthFormProps) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 relative">
            <Navbar />

            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 z-10">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-10 flex flex-col gap-8">

                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight text-center leading-tight">
                            {title}
                        </h2>
                    </div>
                    <>
                        {children}
                    </>
                </div>
            </div>
        </div>
    );
}