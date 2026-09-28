import AuthPage from "./AuthPage.tsx";
import React, {useState} from "react";
import type {AxiosError} from "axios";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {authService} from "../api/authService.ts";
import SubmitButton from "../components/buttons/SubmitButton.tsx";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();

    const [password, setPassword] = useState<string>("");
    const [passwordCheck, setPasswordCheck] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!searchParams.get('token')) {
            setError("Při změně hesla došlo k chybě.")
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(searchParams.get('token') as string, password);
            navigate("/login?updated-password=true", { replace: true });
        } catch (err) {
            const axiosError = err as AxiosError<{ detail?: string }>;
            const errorMsg = axiosError.response?.data?.detail || "Chyba při obnovení hesla.";
            setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthPage title="Obnovit heslo">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-4">
                    {error}
                </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Heslo*</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 font-medium"
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

                <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Heslo*</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="passwordCheck"
                            required
                            value={passwordCheck}
                            onChange={(e) => setPasswordCheck(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 font-medium"
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

                <Link to="/login">
                    <div className="text-sm font-bold text-slate-500 hover:text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 transition-colors cursor-pointer">
                        Vrátit se zpět na přihlášení
                    </div>
                </Link>
                <SubmitButton title={loading ? 'Zpracovávám...' : 'Obnovit heslo'} disabled={loading} />
            </form>
        </AuthPage>
    )
}