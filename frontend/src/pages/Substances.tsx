import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { openSafetySheet } from "../utils/fileUtils.jsx";
import Spinner from "../components/Spinner.jsx";
import AddButton from "../components/AddButton.jsx";
import api from "../api/axios.js";
import { substanceService } from "../api/substanceService.ts";
import type { SubstanceRead } from "../schemas/Substance.ts";
import Navbar from "../components/Navbar.tsx";
import Page from "../components/Page.tsx";

function Substances() {
    const [substances, setSubstances] = useState<SubstanceRead[]>();
    const [loading, setLoading] = useState(true);
    const [years, setYears] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [pages, setPages] = useState(1);
    const [limit, setLimit] = useState(0);
    const [page, setPage] = useState(0);
    const [orderBy, setOrderBy] = useState("name");
    const [sortDesc, setSortDesc] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState({
        department_name: undefined,
        year: undefined,
    });

    const navigate = useNavigate();

    useEffect(() => {
        api.get("/departments")
            .then((response) => {
                setDepartments(response.data);
            });
        api.get("/records/years")
            .then((response) => {
                setYears(response.data);
            });
    }, []);

    useEffect(() => {
        setLoading(true);
        substanceService.getSubstances(page * limit, orderBy, sortDesc, filter.department_name, filter.year, search)
            .then(data => {
                setSubstances(data.items);
                setLimit(data.limit);
                setPages(Math.ceil(data.total / data.limit));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page, orderBy, sortDesc, filter.department_name, filter.year, search]);

    return (
        <Page>
            <Navbar />
            {/* PŘIDÁNO: w-full a min-w-0 pro zabránění přetečení flex kontejneru */}
            <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 min-w-0">

                {/* Horní panel */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full">

                    {/* Skupina pro vyhledávání a filtry */}
                    <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 w-full xl:w-auto">

                        {/* Vyhledávání */}
                        <div className="w-full sm:w-64 md:w-72">
                            <input
                                type="text"
                                placeholder="Hledej látku..."
                                value={search}
                                onChange={e => {
                                    setPage(0);
                                    setSearch(e.target.value);
                                }}
                                className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        {/* Filtr oddělení */}
                        <div className="w-full sm:w-64 md:w-72">
                            <select
                                id="department"
                                value={filter.department_name || ""}
                                onChange={(e) => {
                                    setPage(0);
                                    setFilter({
                                        ...filter,
                                        department_name: e.target.value || undefined
                                    });
                                }}
                                className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer truncate"
                            >
                                <option value="">Všechna oddělení</option>
                                {departments.map(department => (
                                    <option key={department.name} value={department.name}>{department.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtr roku */}
                        <div className="w-full sm:w-40">
                            <select
                                id="year"
                                value={filter.year || ""}
                                onChange={(e) => {
                                    setPage(0);
                                    setFilter({
                                        ...filter,
                                        year: e.target.value || undefined
                                    });
                                }}
                                className="w-full px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                            >
                                <option value="">Všechny roky</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tlačítko pro přidání */}
                    <div className="shrink-0 w-full sm:w-auto flex justify-end">
                        <AddButton endpoint='/add-substance' />
                    </div>
                </div>

                {/* Stránkování (beze změny) */}
                {pages > 1 && (
                    <div className="flex flex-row flex-wrap gap-2 items-center">
                        {Array.from({ length: pages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setPage(index)}
                                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all ${
                                    page === index
                                        ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-950"
                                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* Hlavní kontejner tabulky - PŘIDÁNO: min-w-0 a w-full pro správný vnitřní scroll */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col w-full min-w-0 overflow-hidden">
                    {/* Vnitřní scrollovací wrapper - w-full zajistí, že nebude větší než rodič */}
                    <div className="overflow-x-auto overflow-y-auto max-h-[70vh] relative custom-scrollbar w-full">
                        <div className="min-w-[1300px] flex flex-col">

                            {/* Hlavička tabulky */}
                            <div className="sticky top-0 z-30 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center shadow-sm">
                                <div
                                    className="sticky left-0 z-40 bg-slate-50 dark:bg-slate-950 px-5 py-4 w-[260px] flex justify-between items-center cursor-pointer select-none border-r border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                    onClick={() => {
                                        setOrderBy("name");
                                        setSortDesc(!sortDesc);
                                    }}
                                >
                                    <span>Název</span>
                                    <span className="text-indigo-500">{orderBy === "name" ? (!sortDesc ? "▲" : "▼") : ""}</span>
                                </div>
                                <div className="px-5 py-4 w-[110px]">Látka/Směs</div>
                                <div className="px-5 py-4 w-[140px]">Fyzikální forma</div>
                                <div className="px-5 py-4 w-[160px]">Doplňující forma</div>
                                <div className="px-5 py-4 flex-1 min-w-[200px]">Vlastnosti</div>
                                <div className="px-5 py-4 w-[70px] text-center" title="Bezpečnostní list">BL</div>
                                <div className="px-5 py-4 w-[120px] text-right" title="Maximální skladované množství v tunách">Max. sklad.</div>
                                <div className="px-5 py-4 w-[120px]">Kat. nebezp.</div>
                                <div className="px-5 py-4 w-[100px]">EC50</div>
                                <div className="px-5 py-4 w-[90px]">Jednotka</div>
                                <div className="px-5 py-4 w-[160px]">Oddělení</div>
                            </div>

                            {/* Tělo tabulky */}
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {loading ? (
                                    <div className="py-20 flex justify-center items-center">
                                        <Spinner />
                                    </div>
                                ) : substances && substances.length > 0 ? (
                                    substances.map((substance) => (
                                        <div
                                            key={substance.id}
                                            className="flex items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-sm text-slate-700 dark:text-slate-300 group"
                                        >
                                            {/* Fixní levý sloupec */}
                                            <div
                                                className="sticky left-0 z-20 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/40 px-5 py-3.5 w-[260px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer truncate border-r border-slate-100 dark:border-slate-800/60 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]"
                                                onClick={() => navigate(`/edit-substance/${substance.id}`)}
                                                title={substance.name}
                                            >
                                                {substance.name}
                                            </div>

                                            <div className="px-5 py-3.5 w-[110px]">
                                                {substance.mixture ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Směs</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Látka</span>
                                                )}
                                            </div>

                                            <div className="px-5 py-3.5 w-[140px] truncate">
                                                {substance.physical_form_name ?? "-"}
                                            </div>

                                            <div className="px-5 py-3.5 w-[160px] truncate text-slate-500" title={substance.note ?? ""}>
                                                {substance.note || "-"}
                                            </div>

                                            <div className="px-5 py-3.5 flex-1 min-w-[200px] flex flex-col gap-1.5">
                                                {substance.properties && substance.properties.map((property, index) => (
                                                    <div key={index} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 px-2.5 py-1.5 rounded-md">
                                                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                                                            {`${property.name} ${property.category_name || ""} ${property.exposure_route_name ? `(${property.exposure_route_name})` : ""}`}
                                                        </span>
                                                        <div className="flex gap-1.5 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                                                            {property.h_statement.map((statement, idx) => (
                                                                <span key={idx} className="bg-indigo-50 dark:bg-indigo-900/40 px-1 rounded">{statement.code}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div
                                                onClick={() => substance.sds && openSafetySheet(substance.id)}
                                                className={`px-5 py-3.5 w-[70px] text-center flex justify-center ${substance.sds ? "cursor-pointer hover:scale-110 transition-transform" : "opacity-30"}`}
                                                title={substance.sds ? "Zobrazit bezpečnostní list" : "Bezpečnostní list chybí"}
                                            >
                                                {substance.sds ? "📄" : "-"}
                                            </div>

                                            <div className="px-5 py-3.5 w-[120px] text-right font-mono text-slate-600 dark:text-slate-400">
                                                {substance.hazard_category.length > 0 && substance.hazard_category[0].max_amount_b !== undefined
                                                    ? <span className="font-medium text-slate-900 dark:text-slate-100">{substance.hazard_category[0].max_amount_b} t</span>
                                                    : "-"}
                                            </div>

                                            <div className="px-5 py-3.5 w-[120px] font-mono text-xs truncate">
                                                {substance.hazard_category.length > 0 ? (
                                                    <span className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-2 py-1 rounded-md border border-rose-100 dark:border-rose-800/50">
                                                        {substance.hazard_category[0].code}
                                                    </span>
                                                ) : "-"}
                                            </div>

                                            <div className="px-5 py-3.5 w-[100px] font-mono truncate" title={substance.water_toxicity_ec50 ?? ""}>
                                                {substance.water_toxicity_ec50 ?? "-"}
                                            </div>

                                            <div className="px-5 py-3.5 w-[90px] text-slate-500 truncate" title={substance.unit_name ?? ""}>
                                                {substance.unit_name ?? "-"}
                                            </div>

                                            <div className="px-5 py-3.5 w-[160px] shrink-0 flex flex-col items-start gap-1.5 text-[11px]">
                                                {substance.departments?.map((d, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full truncate max-w-full inline-block"
                                                        title={d.department?.name}
                                                    >
                                                        {d.department?.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                                        <span className="text-3xl mb-2">🔍</span>
                                        <p>Nebyly nalezeny žádné látky.</p>
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

export default Substances;