import {useEffect, useState} from "react";
import { useNavigate, useParams } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import SubstanceForm from "../components/SubstanceForm.tsx";
import Navbar from "../components/Navbar.tsx";
import Page from "../components/Page.tsx";
import api from "../api/axios.js";
import {substanceService} from "../api/substanceService.ts";
import type {SubstanceRead} from "../schemas/Substance.ts";

interface SubstanceFormState extends SubstanceRead {
    property_ids?: number[];
}

function EditSubstance() {
    const { substanceId } = useParams();
    const [alert, setAlert] = useState({ message: "", type: "" });
    const navigate = useNavigate();
    const [substance, setSubstance] = useState<SubstanceFormState>();
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleSubmit = async (e, substance, sds) => {
        e.preventDefault();
        console.log(substance);
        try {
            await api.patch(`/substances/${substanceId}`, substance);

            if (sds) {
                const formData = new FormData();
                formData.append("file", sds);

                await api.post(`/substances/${substanceId}/sds`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            navigate("/substances");
        } catch (error) {
            const errorMsg = error.response?.data?.detail || "Chyba při aktualizaci látky";
            setAlert({ message: errorMsg, type: "danger" });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (!substanceId) return;

        substanceService.getSubstance(Number(substanceId))
            .then((data) => {
                setSubstance({
                    ...data,
                    property_ids: data.properties ? data.properties.map(p => p.id) : []
                });
                setLoading(false);
            });
    }, [substanceId]);

    function handleDelete() {
        api.delete(`/substances/${substance.id}`)
            .then(() => navigate("/substances"))
            .catch(console.error);
    }

    if (loading || !substance) {
        return (
            <Page>
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <p className="text-slate-500 font-bold">Načítám data...</p>
                </div>
            </Page>
        );
    }

    return (
        <Page>
            <Navbar />
            <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
                {alert.message && (
                    <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "" })} />
                )}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 w-full max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Upravit látku</h2>
                        <button type="button" onClick={() => setIsDeleteModalOpen(true)}
                                className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors shadow-sm">
                            Odstranit látku
                        </button>
                    </div>
                    <SubstanceForm
                        initialData={substance}
                        handleSubmit={handleSubmit}
                        substanceId={substanceId}
                    />

                    {isDeleteModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Smazat látku?</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tato akce je nevratná.</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 py-2">Opravdu chceš trvale odstranit látku <b className="text-slate-900 dark:text-white">{substance.name}</b> ze systému?</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                    <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto">Zrušit</button>
                                    <button onClick={handleDelete} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-sm transition-colors w-full sm:w-auto">Ano, smazat</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Page>
    );
}

export default EditSubstance;