import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.ts";
import Page from "../components/Page.tsx";
import Navbar from "../components/Navbar.tsx";
import Spinner from "../components/Spinner";

function Departments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/departments")
            .then((response) => {
                setDepartments(response.data);
                setLoading(false);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <Page>
            <Navbar />
            <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 min-w-0">

                {/* Hlavička / Filtr (volitelně pro budoucí rozšíření, styl sjednocen se Substances) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between w-full">
                    <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 px-2">
                        Seznam oddělení
                    </h1>
                </div>

                {/* Hlavní tabulkový kontejner */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col w-full min-w-0 overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto max-h-[70vh] relative custom-scrollbar w-full">
                        <div className="flex flex-col w-full">

                            {/* Záhlaví tabulky */}
                            <div className="sticky top-0 z-30 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center shadow-sm">
                                <div className="px-6 py-4 w-[140px]">Kód</div>
                                <div className="px-6 py-4 flex-1 min-w-[200px]">Název</div>
                                <div className="px-6 py-4 flex-1 min-w-[200px]">Zodpovědná osoba</div>
                                <div className="px-6 py-4 w-[140px] text-right">Počet látek</div>
                            </div>

                            {/* Tělo tabulky */}
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {loading ? (
                                    <div className="py-20 flex justify-center items-center">
                                        <Spinner />
                                    </div>
                                ) : departments && departments.length > 0 ? (
                                    departments.map((department) => (
                                        <Link
                                            key={department.id}
                                            to={`/inventory/${department.name}`}
                                            className="flex items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-sm text-slate-700 dark:text-slate-300 group"
                                        >
                                            {/* Kód */}
                                            <div className="px-6 py-4 w-[140px] font-mono text-xs font-medium text-slate-600 dark:text-slate-400">
                                                {department.code}
                                            </div>

                                            {/* Název (zvýrazněný v duchu názvů látek) */}
                                            <div className="px-6 py-4 flex-1 min-w-[200px] font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-800 dark:group-hover:text-indigo-300 transition-colors">
                                                {department.name}
                                            </div>

                                            {/* Zodpovědná osoba */}
                                            <div className="px-6 py-4 flex-1 min-w-[200px] text-slate-600 dark:text-slate-300 truncate">
                                                {department.manager || "-"}
                                            </div>

                                            {/* Počet látek (zarovnaný vpravo s monospace fontem jako množství) */}
                                            <div className="px-6 py-4 w-[140px] text-right font-mono">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                    0
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="py-20 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                                        <span className="text-3xl mb-2">🔍</span>
                                        <p>Nebyly nalezeny žádné oddělení.</p>
                                        <p className="text-xs text-slate-400">Zkuste upravit filtry nebo vyhledávací dotaz.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Page>
    );
}

export default Departments;