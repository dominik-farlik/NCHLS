import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { inventoryReportService, type InventoryReportFormat } from "../api/inventoryReportService.ts";

interface Props {
    departmentId: number;
    year: number;
    responsibleEmployee: string;
    onClose: () => void;
}

const todayIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function InventoryExportDialog({ departmentId, year, responsibleEmployee, onClose }: Props) {
    const [date, setDate] = useState(todayIso());
    const [performedBy, setPerformedBy] = useState("");
    const [responsible, setResponsible] = useState(responsibleEmployee);
    const [contact, setContact] = useState("");
    const [downloading, setDownloading] = useState<InventoryReportFormat | null>(null);

    useEffect(() => {
        inventoryReportService.getDefaults(departmentId)
            .then((defaults) => {
                setContact(defaults.contact);
                if (!responsibleEmployee) setResponsible(defaults.responsible_employee);
            })
            .catch(() => toast.error("Nepodařilo se načíst výchozí údaje pro export"));
    }, [departmentId, responsibleEmployee]);

    const handleDownload = (format: InventoryReportFormat) => {
        setDownloading(format);
        inventoryReportService.download(departmentId, {
            year,
            format,
            date,
            responsible_employee: responsible,
            performed_by: performedBy,
            contact,
        })
            .then(() => onClose())
            .catch(() => toast.error("Export se nepodařil"))
            .finally(() => setDownloading(null));
    };

    const inputClass = "w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500";
    const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-6 flex flex-col gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Export inventarizace {year}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Doplňte údaje, které nejsou v databázi.</p>
                    </div>

                    <div>
                        <label className={labelClass}>Datum</label>
                        <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Zodpovědný pracovník</label>
                        <input type="text" className={inputClass} value={responsible}
                               onChange={(e) => setResponsible(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Inventarizaci provedl</label>
                        <input type="text" className={inputClass} value={performedBy}
                               placeholder="Např. Jan Novák a Petra Nová"
                               onChange={(e) => setPerformedBy(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>Kontaktní údaje (konec dokumentu)</label>
                        <textarea rows={5} className={inputClass} value={contact}
                                  placeholder={"Jméno a titul\nFunkce\nOrganizace\nAdresa\nE-mail"}
                                  onChange={(e) => setContact(e.target.value)} />
                        <p className="text-xs text-slate-500 mt-1">Ukládá se pro celou společnost a příště se předvyplní.</p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl">
                    <button onClick={onClose}
                            className="px-5 py-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        Zrušit
                    </button>
                    <button onClick={() => handleDownload("docx")} disabled={downloading !== null}
                            className="px-5 py-2.5 rounded-lg font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 disabled:opacity-50 transition-colors">
                        {downloading === "docx" ? "Generuji…" : "Stáhnout DOCX"}
                    </button>
                    <button onClick={() => handleDownload("pdf")} disabled={downloading !== null}
                            className="px-5 py-2.5 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-colors">
                        {downloading === "pdf" ? "Generuji…" : "Stáhnout PDF"}
                    </button>
                </div>
            </div>
        </div>
    );
}
