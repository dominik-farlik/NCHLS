import { Link } from "react-router-dom";
import Page from "../components/Page.tsx";
import Navbar from "../components/Navbar.tsx";

export default function Forbidden() {
    return (
        <Page>
            <Navbar />
            <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[70vh]">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-sm flex flex-col items-center text-center max-w-lg w-full gap-6">

                    <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 text-3xl font-bold shadow-inner">
                        403
                    </div>

                    <div className="flex flex-col gap-2">
                        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100">
                            Přístup odepřen
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            Nemáš dostatečná oprávnění k zobrazení této stránky. Pokud se domníváš, že jde o chybu, kontaktuj správce systému.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                        <Link
                            to="/"
                            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium text-sm transition-colors text-center shadow-sm"
                        >
                            Přejít na úvod
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors text-center"
                        >
                            Vrátit se zpět
                        </button>
                    </div>

                </div>
            </div>
        </Page>
    );
}