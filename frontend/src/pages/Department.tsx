import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.ts";
import Page from "../components/Page.tsx";
import Navbar from "../components/Navbar.tsx";
import Spinner from "../components/Spinner.jsx";
import type {DepartmentSubstanceRead, DepartmentSubstanceCreate, DepartmentRead} from "../schemas/Department.ts";
import type { SubstanceRead } from "../schemas/Substance.ts";
import {substanceService} from "../api/substanceService.ts";
import toast from "react-hot-toast";
import {departmentSubstanceService} from "../api/departmentSubstanceService.ts";

export default function Department() {
    const { departmentId } = useParams<{ departmentId: string }>();
    const [department, setDepartment] = useState<DepartmentRead>();
    const navigate = useNavigate();

    const [records, setRecords] = useState<DepartmentSubstanceRead[]>([]);
    const [substanceList, setSubstanceList] = useState<SubstanceRead[]>([]);

    const [year, setYear] = useState(new Date().getFullYear());
    const [responsibleEmployee, setResponsibleEmployee] = useState("");
    const [loading, setLoading] = useState(true);

    const [newRecord, setNewRecord] = useState({ name: "", amount: 0 });

    useEffect(() => {
        api.get(`/departments/${departmentId}`)
            .then((res) => {
                setDepartment(res.data);
                setResponsibleEmployee(res.data.manager || "");
            })

        substanceService.getSubstances()
            .then((data) => setSubstanceList(data.items));
    }, []);

    useEffect(() => {
        if (!departmentId) return;
        setLoading(true);

        departmentSubstanceService.getDepartmentSubstances(Number(departmentId), year)
            .then((res) => {setRecords(res)})
            .catch((err)=> toast.error(err))
            .finally(() => setLoading(false));
    }, [departmentId, year]);

    const handleAmountChange = (index: number, val: number) => {
        const payload: DepartmentSubstanceCreate = {
            department_id: department.id,
            substance_id: records[index].substance.id,
            year: year,
            amount: val
        }

        departmentSubstanceService.updateDepartmentSubstance(payload)
            .then(() => {
                toast.success("Množství změneno");
                const copy = [...records];
                copy[index].amount = val;
                setRecords(copy);
            })
            .catch((err) => toast.error(err));
    };

    const handleAddRecord = () => {
        const found = substanceList.find((s) => s.name === newRecord.name);
        if (!found) return toast.error("Látka nenalezena!");

        if (records.some(r => r.substance.id === found.id)) {
            return toast.error("Tato látka už se na tomto oddělení v roce v daném roce nachází");
        }

        const payload: DepartmentSubstanceCreate = {
            department_id: department.id,
            substance_id: found.id,
            year: year,
            amount: newRecord.amount
        }

        departmentSubstanceService.createDepartmentSubstance(payload)
            .then(() => {
                toast.success("Látka přidána");
                setRecords([...records, {
                    substance: found,
                    amount: Number(newRecord.amount),
                    year,
                    department: { id: department.id, name: department.name!, company_id: found.company_id || 0 },
                }]);
                setNewRecord({ name: "", amount: 0 });
            })
            .catch((err) => toast.error(err));
    };

    const handleDelete = (substanceId: number) => {
        departmentSubstanceService.deleteDepartmentSubstance(substanceId, department.id, year)
            .then(()=> {
                setRecords(records.filter((r) => r.substance.id !== substanceId));
                toast.success("Látka byla úspěšně smazána")
            })
            .catch((err)=> toast.error(err))
    };

    const handleSubmit = async () => {
        if (!departmentId) return;

        const payload: DepartmentSubstanceCreate[] = records.map((r) => ({
            department_id: department.id,
            substance_id: r.substance.id,
            year,
            amount: r.amount,
        }));

        if (department.manager !== responsibleEmployee && responsibleEmployee !== "") {
            await api.patch(`/departments/${department.id}`, {manager: responsibleEmployee})
                .catch((err)=> console.error(err));
        }

        await api.post(`/records/bulk?department_id=${department.id}&year=${year}`, payload)
            .then(()=> navigate("/departments"))
            .catch((err)=> {
                console.error(err);
                alert("Nepodařilo se uložit stav oddělení.");
            })
    };

    return (
        <Page>
            <Navbar />
            <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{department && department.name}</h1>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Zodpovědný pracovník"
                            className="px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none w-full sm:w-64"
                            value={responsibleEmployee}
                            onChange={(e) => setResponsibleEmployee(e.target.value)}
                        />
                        <input
                            type="number"
                            className="px-3 py-2 text-sm text-center font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none w-24"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto max-h-[70vh] custom-scrollbar">
                        <div className="min-w-[900px]">
                            <div className="sticky top-0 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase flex items-center shadow-sm">
                                <div className="px-5 py-4 flex-1">Látka</div>
                                <div className="px-5 py-4 w-[200px]">Množství</div>
                                <div className="px-5 py-4 w-[120px] text-center">Akce</div>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {loading ? (
                                    <div className="py-20 flex justify-center"><Spinner /></div>
                                ) : (
                                    <>
                                        {records.map((r, i) => (
                                            <div key={i} className="flex items-center text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                <div className="px-5 py-3.5 flex-1 font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                                                    {r.substance.name}
                                                </div>
                                                <div className="px-5 py-3.5 w-[200px]">
                                                    <div className="flex border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                                                        <input
                                                            type="number"
                                                            className="w-full px-3 py-1.5 outline-none bg-transparent"
                                                            value={r.amount}
                                                            onChange={(e) => handleAmountChange(i, Number(e.target.value))}
                                                        />
                                                        <span className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 border-l border-slate-300 dark:border-slate-600 flex items-center">
                                                            {r.substance.unit_name || "ks"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="px-5 py-3.5 w-[120px] flex justify-center">
                                                    <button
                                                        onClick={()=> {
                                                            toast((t) => (
                                                                <div className="flex flex-col gap-1.5">
                                                                    Opravdu chcete odstranit: <b>{r.substance.name}?</b>
                                                                    <div className="flex justify-between">
                                                                        <button
                                                                            className="px-3 py-1.5 text-xs text-emerald-600  bg-green-50 border border-green-200 rounded-lg hover:bg-green-100  transition-colors shadow-sm"
                                                                            onClick={() => toast.dismiss(t.id)}
                                                                        >
                                                                            Ponechat
                                                                        </button>
                                                                        <button
                                                                            className="px-3 py-1.5 text-xs text-rose-600  bg-rose-50  border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors shadow-sm"
                                                                            onClick={() => {
                                                                                handleDelete(r.substance.id);
                                                                                toast.dismiss(t.id);
                                                                            }}
                                                                        >
                                                                            Odstranit
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ));
                                                        }}
                                                        className="px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors shadow-sm"
                                                    >
                                                        Odstranit
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Nový záznam */}
                                        <div className="flex items-center bg-slate-50/50 dark:bg-slate-900/50">
                                            <div className="px-5 py-3.5 flex-1">
                                                <input
                                                    type="text"
                                                    list="subs-list"
                                                    placeholder="Vybrat látku k přidání..."
                                                    className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                                                    value={newRecord.name}
                                                    onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                                                />
                                                <datalist id="subs-list">
                                                    {substanceList.length > 0 && substanceList.map(s => <option key={s.id} value={s.name} />)}
                                                </datalist>
                                            </div>
                                            <div className="px-5 py-3.5 w-[200px]">
                                                <input
                                                    type="number"
                                                    placeholder="Množství"
                                                    className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none"
                                                    value={newRecord.amount}
                                                    onChange={(e) => setNewRecord({ ...newRecord, amount: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="px-5 py-3.5 w-[120px] flex justify-center">
                                                <button onClick={handleAddRecord} className="px-3 py-1.5 text-xs text-emerald-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors shadow-sm">
                                                    Přidat
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button onClick={handleSubmit} className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all">
                        Uložit stav oddělení
                    </button>
                </div>
            </div>
        </Page>
    );
}