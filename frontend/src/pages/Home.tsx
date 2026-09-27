import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth.ts";
import Page from "../components/Page.tsx";
import Navbar from "../components/Navbar.tsx";

export default function Home() {
    const { user } = useAuth();

    const displayName = user?.first_name || user?.last_name || (user as any)?.email || "uživateli";

    return (
        <Page>
            <Navbar />
            <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 min-w-0">

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Přehled systému
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                            Vítej zpět, {displayName}! 👋
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Zde je rychlý přehled dostupných sekcí a odkazů ve Webové aplikaci.
                        </p>
                    </div>

                    {user?.role && (
                        <div className="px-3.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                            Role: {typeof user.role === 'object' ? user.role.name : user.role}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">

                    <Link
                        to="/departments"
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                        <div className="flex flex-col gap-3">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl font-semibold shadow-inner group-hover:scale-105 transition-transform">
                                🏢
                            </div>
                            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                Seznam oddělení
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Správa a procházení oddělení, kódů a zodpovědných osob v organizaci.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 gap-1">
                            Otevřít sekci &rarr;
                        </div>
                    </Link>

                    <Link
                        to="/substances"
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                        <div className="flex flex-col gap-3">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl font-semibold shadow-inner group-hover:scale-105 transition-transform">
                                🧪
                            </div>
                            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                Seznam látek
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Seznam všech zaregistrovaných látek v organizaci.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 gap-1">
                            Otevřít sekci &rarr;
                        </div>
                    </Link>
                </div>
            </div>
        </Page>
    );
}