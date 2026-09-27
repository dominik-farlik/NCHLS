import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthPage from "./AuthPage.tsx";
import type { AxiosError } from "axios";
import type {UserCreate} from "../schemas/User.ts";
import {authService} from "../api/authService.ts";

export default function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [user, setUser] = useState<UserCreate>({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
        setError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!user.email || !user.password || !user.first_name || !user.last_name) {
            setError("Vyplňte prosím všechna povinná pole.");
            return;
        }

        setLoading(true);

        try {
            await authService.createUser({
                ...user,
                username: user.username || null,
            });
            setSuccessMessage("Účet byl úspěšně vytvořen. Nyní se můžete přihlásit.");
            navigate("/login?registered=true", { replace: true });
        } catch (err) {
            const axiosError = err as AxiosError<{ detail?: string }>;
            const errorMsg = axiosError.response?.data?.detail || "Chyba při registraci.";
            setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthPage title="Vytvořte si nový účet">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="bg-[#4ade80]/20 border border-[#4ade80]/30 text-[#16a34a] px-4 py-3 rounded-xl text-sm font-medium mb-4">
                    {successMessage}
                </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Jméno*</label>
                        <input
                            type="text"
                            name="first_name"
                            required
                            value={user.first_name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#4ade80]/20 transition-all text-slate-900 font-medium"
                            placeholder="Jan"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Příjmení*</label>
                        <input
                            type="text"
                            name="last_name"
                            required
                            value={user.last_name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#4ade80]/20 transition-all text-slate-900 font-medium"
                            placeholder="Novák"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">E-mailová adresa*</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={user.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#4ade80]/20 transition-all text-slate-900 font-medium"
                        placeholder="vas@email.cz"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Heslo*</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            value={user.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#4ade80]/20 transition-all text-slate-900 font-medium pr-12"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none p-1 transition-colors"
                            title={showPassword ? "Skrýt heslo" : "Zobrazit heslo"}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-[#4ade80] hover:bg-[#22c55e] text-slate-900 font-black text-lg py-3.5 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide shadow-sm"
                >
                    {loading ? 'Zpracovávám...' : 'Zaregistrovat se'}
                </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
                <Link
                    to="/login"
                    className="text-sm font-bold text-slate-500 hover:text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 transition-colors cursor-pointer"
                >
                    Již máte účet? Přihlaste se
                </Link>
            </div>
        </AuthPage>
    );
}