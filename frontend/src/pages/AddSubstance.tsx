import { useState } from 'react';
import Alert from "../components/Alert.jsx";
import SubstanceForm from "../components/SubstanceForm.tsx";
import Navbar from "../components/Navbar.tsx";
import Page from "../components/Page.tsx";
import api from "../api/axios.js";
import type {SubstanceCreate} from "../schemas/Substance.ts";

function AddSubstance() {
    const [alert, setAlert] = useState({ message: "", type: "" });

    const handleSubmit = async (e, substance, sds) => {
        e.preventDefault();

        const cleanedPropertyIds = substance.property_ids
            ? substance.property_ids
                .filter(id => id !== "" && id !== null && id !== undefined)
                .map(id => Number(id))
            : [];

        const payload = {
            ...substance,
            property_ids: cleanedPropertyIds,
        };


        try {
            const response = await api.post("/substances", payload);
            const createdSubstance = response.data;

            setAlert({ message: "Látka byla přidána", type: "success" });

            if (sds) {
                const formData = new FormData();
                formData.append("file", sds);

                await api.post(`/substances/${createdSubstance.id}/sds`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            const errorMsg = error.response?.data?.detail || "Neznámá chyba při ukládání";
            setAlert({ message: errorMsg, type: "danger" });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const defaultInitialSubstance: SubstanceCreate = {
        name: '',
        code: undefined,
        hazard_category: [],
        manufacturer: undefined,
        mixture: true,
        note: undefined,
        physical_form_name: undefined,
        property_ids: [],
        sds: undefined,
        sds_revision_year: undefined,
        unit_name: undefined,
        water_toxicity_ec50: undefined,
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
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Přidat látku</h2>
                    </div>
                    <SubstanceForm
                        initialData={defaultInitialSubstance}
                        handleSubmit={handleSubmit}
                    />
                </div>
            </div>
        </Page>
    );
}

export default AddSubstance;