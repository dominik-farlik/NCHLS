import SubstanceForm from "../components/SubstanceForm.tsx";
import Navbar from "../components/Navbar.tsx";
import Page from "../components/Page.tsx";
import api from "../api/axios.js";
import type {SubstanceCreate} from "../schemas/Substance.ts";
import {substanceService} from "../api/substanceService.ts";
import toast from "react-hot-toast";

function AddSubstance() {

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

        substanceService.createSubstance(payload)
            .then((createdSubstance)=> {
                if (sds) {
                    const formData = new FormData();
                    formData.append("file", sds);

                    api.post(`/substances/${createdSubstance.id}/sds`, formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                }
            })
            .catch((error)=> toast.error(error.response.data.detail))
            .finally(()=> window.scrollTo({ top: 0, behavior: 'smooth' }));
    };

    const defaultInitialSubstance: SubstanceCreate = {
        name: '',
        code: undefined,
        hazard_category_ids: [],
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