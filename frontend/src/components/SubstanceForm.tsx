import { useEffect, useState } from "react";
import { openSafetySheet } from "../utils/fileUtils.ts";
import api from "../api/axios.js";
import type {SubstanceCreate} from "../schemas/Substance.ts";
import type {Property} from "../schemas/Property.ts";

function SubstanceForm({ initialData, handleSubmit, substanceId=null }) {
    const [substance, setSubstance] = useState<SubstanceCreate>(initialData);
    const [sds, setSds] = useState<File | null>(null);
    const [propertyList, setPropertyList] = useState<Property[]>([]);
    const [unitList, setUnitList] = useState([]);
    const [physicalFormList, setPhysicalFormList] = useState([]);

    useEffect(() => {
        api.get("/properties").then(res => setPropertyList(res.data));
        api.get("/units").then(res => setUnitList(res.data));
        api.get("/physical_forms").then(res => setPhysicalFormList(res.data));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSubstance((prev) => ({ ...prev, [name]: value }));
    };

    const inputClass = "w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm";
    const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
    const sectionClass = "bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6";
    const sectionHeaderClass = "text-lg font-bold text-slate-900 dark:text-white mb-5 pb-3 border-b border-slate-200 dark:border-slate-700";

    return (
        <form onSubmit={(e) => handleSubmit(e, substance, sds)}>
            {/* --- SEKCE 1: Základní údaje --- */}
            <div className={sectionClass}>
                <h3 className={sectionHeaderClass}>Základní údaje</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-8">
                        <label className={labelClass}>Název látky <span className="text-rose-500">*</span></label>
                        <input type="text" name="name" value={substance.name} onChange={handleChange}
                               className={inputClass} placeholder="Např. Kyselina sírová" required/>
                    </div>
                    <div className="md:col-span-4">
                        <label className={labelClass}>Typ</label>
                        <div className="flex gap-4">
                            <div className="flex gap-2">
                                <input
                                    type="radio"
                                    id="mixture"
                                    name="mixture"
                                    checked={substance.mixture === true}
                                    onChange={() => {
                                        setSubstance({...substance, mixture: true})
                                    }}
                                    className=""
                                />
                                <label htmlFor="mixture">Směs</label>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="radio"
                                    id="substance"
                                    name="mixture"
                                    checked={substance.mixture === false}
                                    onChange={() => {
                                        setSubstance({...substance, mixture: false})
                                    }}
                                    className="focus:"
                                />
                                <label htmlFor="substance">Látka</label>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-4">
                        <label className={labelClass}>Fyzikální forma</label>
                        <select name="physical_form_name" value={substance.physical_form_name} onChange={handleChange}
                                className={inputClass}>
                            <option value="">Neurčeno</option>
                            {physicalFormList.map(opt => <option key={opt.name} value={opt.name}>{opt.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-4">
                        <label className={labelClass}>Doplňující forma</label>
                        <input type="text" name="note" value={substance.note} onChange={handleChange}
                               className={inputClass} placeholder="Např. IPLP"/>
                    </div>
                    <div className="md:col-span-4">
                        <label className={labelClass}>Výchozí jednotka</label>
                        <select name="unit_name" value={substance.unit_name} onChange={handleChange}
                                className={inputClass}>
                            <option value="">Neurčeno</option>
                            {unitList.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className={sectionClass}>
                <h3 className={sectionHeaderClass}>Bezpečnostní list</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-5">
                        <label className={labelClass}>Bezpečnostní list (Soubor)</label>
                        <div className="flex">
                            <input type="file"
                                   onChange={(e) => setSds(e.target.files[0])}
                                   className={`${inputClass} flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 transition-colors p-1.5 cursor-pointer`}/>
                            {substance.sds && (
                                <button type="button" onClick={() => openSafetySheet(substanceId)}
                                        className="shrink-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-4 flex justify-center items-center text-lg transition-colors"
                                        title="Stáhnout bezpečnostní list">💾</button>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <label className={labelClass}>Datum revize listu</label>
                        <input type="number" name="sds_revision_year" value={substance.sds_revision_year}
                               onChange={handleChange} className={`${inputClass} py-4`}
                               placeholder="Rok (např. 2024)" disabled={!substance.sds}/>
                    </div>
                </div>
            </div>

            <div className={sectionClass}>
                <div
                    className="flex justify-between items-center mb-5 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nebezpečné vlastnosti</h3>
                    <span
                        className="text-xs font-medium text-slate-500 bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-full">Dynamický seznam</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-2 md:grid px-2">
                    <div className="md:col-span-4">
                        {substance.property_ids && substance.property_ids.map((propertyId, index) => {
                            return (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <select
                                        className={`${inputClass} w-64 shrink-0`}
                                        onChange={(e) => {
                                            const updatedProperties = [...substance.property_ids];
                                            updatedProperties[index] = Number(e.target.value);
                                            setSubstance({ ...substance, property_ids: updatedProperties });
                                        }}
                                        value={propertyId}
                                    >
                                        <option value="">-- Vyberte vlastnost --</option>
                                        {propertyList.map((property) => (
                                            <option key={property.id} value={property.id}>
                                                {property.name} {property.category_name} {property.exposure_route_name && `(${property.exposure_route_name})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>

                    <div className="md:col-span-6 flex flex-col gap-2">
                        {substance.property_ids && substance.property_ids.map((propertyId, index) => {
                            const selectedProperty = propertyList.find(p => p.id === propertyId);

                            if (!selectedProperty || !selectedProperty.h_statements || selectedProperty.h_statements.length === 0) {
                                return null;
                            }

                            return (
                                <div key={index} className="flex flex-wrap items-center gap-2 min-h-[38px]">
                                    {selectedProperty.h_statements.map(statement => (
                                        <div
                                            key={statement.code}
                                            className="bg-indigo-50 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-300 border dark:border-indigo-300/30 text-sm"
                                        >
                                            {statement.code}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                    <div className="md:col-span-4">
                        <button
                            className={inputClass}
                            type="button"
                            onClick={() => {
                                setSubstance({
                                    ...substance,
                                    property_ids: [...(substance.property_ids || []), null]
                                })
                            }}
                        >
                            Přidat vlastnost
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="submit"
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-sm hover:shadow transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900">
                    Uložit změny
                </button>
            </div>
        </form>
    );
}

export default SubstanceForm;