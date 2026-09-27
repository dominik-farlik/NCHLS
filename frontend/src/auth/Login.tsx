import React, { useState } from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import AuthPage from "./AuthPage.tsx";
import { authService } from "../api/authService.ts";
import { useAuth } from "../context/useAuth.ts";
import type { AxiosError } from "axios";
import api from "../api/axios.ts";
import type {UserLogin} from "../schemas/User.ts";

export default function Login() {
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(() => {
        return searchParams.get('expired') === 'true'
            ? 'Vaše přihlášení vypršelo. Prosím, přihlaste se znovu.'
            : null;
    });
    const successMessage: string | null =
        (searchParams.get('verified') === 'true'
            ? 'Váš email byl úspěšně ověřen. Nyní se můžete přihlásit.'
            : null) ||
        (searchParams.get('registered') === 'true'
            ? 'Registrace proběhla úspěšně! Na váš e-mail jsme zaslali potvrzovací odkaz. Před prvním přihlášením jej prosím potvrďte.'
            : null) ||
        (searchParams.get('updated-password') === 'true'
            ? 'Váše heslo bylo úspěšně změněno. Nyní se můžete přihlásit.'
            : null)
    const [user, setUser] = useState<UserLogin>({
        username: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!user.username || !user.password) {
            setError("Vyplňte prosím e-mail a heslo.");
            return;
        }

        setLoading(true);

        try {
            await authService.login({
                username: user.username,
                password: user.password,
            });
            const response = await api.get('auth/me/');
            login(response.data);
            navigate('/');
        } catch (err) {
            const axiosError = err as AxiosError<{ detail?: string }>;
            const errorMsg = axiosError.response?.data?.detail || "Chyba při přihlašování.";
            setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthPage title="Přihlaste se do svého účtu">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-[#4ade80]/20 border border-[#4ade80]/30 text-[#16a34a] px-4 py-3 rounded-xl text-sm font-medium">
                    {successMessage}
                </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">E-mailová adresa*</label>
                    <input
                        type="email"
                        name="username"
                        required
                        value={user.username}
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
                        </button>
                    </div>
                </div>
                <Link to="/request-password-reset">
                    <div className="text-sm font-bold text-slate-500 hover:text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 transition-colors cursor-pointer">
                        Obnovit zapomenuté heslo
                    </div>
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-[#4ade80] hover:bg-[#22c55e] text-slate-900 font-black text-lg py-3.5 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide shadow-sm"
                >
                    {loading ? 'Zpracovávám...' : 'Přihlásit se'}
                </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
                <Link
                    to="/register"
                    className="text-sm font-bold text-slate-500 hover:text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 transition-colors cursor-pointer"
                >
                    Nemáte ještě účet? Zaregistrujte se
                </Link>
            </div>
        </AuthPage>
    );
}