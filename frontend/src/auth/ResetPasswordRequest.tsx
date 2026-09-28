import AuthPage from "./AuthPage.tsx";
import React, {useState} from "react";
import type {AxiosError} from "axios";
import {Link} from "react-router-dom";
import {authService} from "../api/authService.ts";
import SubmitButton from "../components/buttons/SubmitButton.tsx";

export default function ResetPasswordRequest() {
    const [email, setEmail] = React.useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSucessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setEmail(value);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!email) {
            setError("Vyplňte prosím e-mail a heslo.");
            return;
        }

        setLoading(true);

        try {
            await authService.requestPasswordReset(email);
            setSucessMessage("Pokud účet s tímto e-mailem existuje, odeslali jsme na něj instrukce k obnově hesla.")
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
                        name="email"
                        required
                        value={email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 font-medium"
                        placeholder="vas@email.cz"
                    />
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