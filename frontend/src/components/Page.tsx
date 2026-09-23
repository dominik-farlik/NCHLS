import React from "react";

export default function Page({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
            {children}
        </div>
    );
}