import { useEffect, useState } from "react";
import {openSafetySheet} from "../utils/fileUtils.jsx";
import {useNavigate} from "react-router-dom";
import Modal from "./Modal.jsx";
import api from "../api/axios.js";

const defaultSubstance = {
    name: '',
    unit: '',
    substance_mixture: '',
    physical_form: '',
    form_addition: [],
    h_phrases: [],
    properties: [{ name: '', category: '', exposure_route: ''}],
    safety_sheet: undefined,
    safety_sheet_rev_date: '',
    danger_category: '',
};

function Substance({ substanceId, handleSubmit, heading, resetSignal }) {
    const [substance, setSubstance] = useState(defaultSubstance);
    const [propertyList, setPropertyList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [physicalFormList, setPhysicalFormList] = useState([]);
    const [formAdditionList, setFormAdditionList] = useState([]);
    const [hphraseList, setHphraseList] = useState([]);
    const [dangerCategories, setDangerCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setSubstance(defaultSubstance);
    }, [resetSignal]);

    useEffect(() => {
        if (!substanceId) return;
        let cancelled = false;

        (async () => {
            const substanceRes = await api.get(`/substances/${substanceId}`);
            const data = substanceRes.data;

            const filePromise = data.safety_sheet
                ? api.get(`/substances/safety_sheet/${substanceId}`).then(r => r.data).catch(err => {
                    if (err?.response?.status !== 404) console.error(err);
                    return undefined;
                })
                : Promise.resolve(undefined);

            const file = await filePromise;

            if (cancelled) return;

            setSubstance({
                ...data,
                form_addition: Array.isArray(data.form_addition) ? data.form_addition : [],
                properties: [
                    ...(data.properties ?? []).filter(p => p.name),
                    { name: "", category: "", exposure_route: "" },
                ],
                safety_sheet: file,
            });
        })().catch(err => {
            if (!cancelled) console.error(err);
        });

        return () => { cancelled = true; };
    }, [substanceId]);

    useEffect(() => {
        api.get("/properties")
            .then(res => setPropertyList(res.data));

        api.get("/units")
            .then(res => setUnitList(res.data));

        api.get("/physical_forms")
            .then(res => setPhysicalFormList(res.data));

        api.get("/form_additions")
            .then(res => setFormAdditionList(res.data));

        api.get("/h_phrases")
            .then(res => setHphraseList(res.data));

        api.get("/danger_categories")
            .then(res => setDangerCategories(res.data));
    }, []);

    function handleDelete() {
        api.delete(`/substances/${substanceId}`)
            .then(() => {
                navigate("/substances");
            })
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSubstance((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (file) => {
        setSubstance({
            ...substance,
            safety_sheet: file,
        })
    }

    const handlePropertyChange = (index, field, value) => {
        const current = substance.properties;
        const newProperties = [...current];
        newProperties[index] = { ...newProperties[index], [field]: value };

        setSubstance((prev) => ({ ...prev, properties: newProperties }));

        if (index === newProperties.length - 1 && (newProperties[index].name || "").trim() !== "") {
            addPropertyRow();
        }
    };

    const toggleFormAddition = (value) => {
        setSubstance(prev => {
            const current = Array.isArray(prev.form_addition) ? prev.form_addition : [];
            return {
                ...prev,
                form_addition: current.includes(value)
                    ? current.filter(v => v !== value)
                    : [...current, value],
            };
        });
    };

    const toggleHphrase = (value) => {
        setSubstance(prev => {
            const current = Array.isArray(prev.h_phrases) ? prev.h_phrases : [];
            return {
                ...prev,
                h_phrases: current.includes(value)
                    ? current.filter(v => v !== value)
                    : [...current, value],
            };
        });
    };

    const addPropertyRow = () => {
        setSubstance((prev) => ({
            ...prev,
            properties: [...prev.properties, { name: '', category: '', exposure_route: '' }],
        }));
    };

    const removePropertyRow = (index) => {
        const updated = substance.properties.filter((_, i) => i !== index);
        setSubstance((prev) => ({
            ...prev,
            properties: updated.length > 0 ? updated : [{ name: '', category: '', exposure_route: '' }],
        }));
    };

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h2 className="mb-4">{heading}</h2>
                <form onSubmit={(e) => handleSubmit(e, substance)}>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="name" className="form-label fw-bold">Název</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={substance.name}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Zadejte název látky"
                                required
                            />
                        </div>
                        <div className="col-md-2">
                            <label htmlFor="substance_mixture" className="form-label fw-bold">Látka/Směs</label>
                            <select
                                id="substance_mixture"
                                name="substance_mixture"
                                value={substance.substance_mixture}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="" disabled />
                                <option value="látka">látka</option>
                                <option value="směs">směs</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label htmlFor="physical_form" className="form-label fw-bold">Fyzikální forma</label>
                            <select
                                id="physical_form"
                                name="physical_form"
                                value={substance.physical_form}
                                onChange={handleChange}
                                className="form-select"
                            >
                                {physicalFormList.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label fw-bold">Doplňující forma</label>

                            <div className="dropdown w-100">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary dropdown-toggle w-100 text-truncate"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    title={substance.form_addition.join(", ")}
                                >
                                    {(substance.form_addition?.length ?? 0) > 0
                                        ? substance.form_addition.join(", ")
                                        : "Vyber"}
                                </button>

                                <ul className="dropdown-menu p-2 w-100" style={{ maxHeight: "240px", overflowY: "auto" }}>
                                    {formAdditionList.map(val => (
                                        <li key={val}>
                                            <label className="dropdown-item d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input m-0"
                                                    checked={(substance.form_addition ?? []).includes(val)}
                                                    onChange={() => toggleFormAddition(val)}
                                                />
                                                <span>{val}</span>
                                            </label>
                                        </li>
                                    ))}

                                    {(substance.form_addition?.length ?? 0) > 0 && (
                                        <>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button
                                                    type="button"
                                                    className="dropdown-item text-danger"
                                                    onClick={() => setSubstance(prev => ({ ...prev, form_addition: [] }))}
                                                >
                                                    Vymazat výběr
                                                </button>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label fw-bold">H-věty</label>

                            <div className="dropdown w-100">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary dropdown-toggle w-100 text-truncate"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    title={substance.h_phrases?.join(", ")}
                                >
                                    {(substance.h_phrases?.length ?? 0) > 0
                                        ? substance.h_phrases.join(", ")
                                        : "Vyber"}
                                </button>

                                <ul className="dropdown-menu p-2 w-100" style={{ maxHeight: "240px", overflowY: "auto" }}>
                                    {hphraseList.map(val => (
                                        <li key={val}>
                                            <label className="dropdown-item d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input m-0"
                                                    checked={(substance.h_phrases ?? []).includes(val)}
                                                    onChange={() => toggleHphrase(val)}
                                                />
                                                <span>{val}</span>
                                            </label>
                                        </li>
                                    ))}

                                    {(substance.h_phrases?.length ?? 0) > 0 && (
                                        <>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button
                                                    type="button"
                                                    className="dropdown-item text-danger"
                                                    onClick={() => setSubstance(prev => ({ ...prev, form_addition: [] }))}
                                                >
                                                    Vymazat výběr
                                                </button>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-2">
                            <label htmlFor="physical_form" className="form-label fw-bold">Kategorie nebezpečnosti</label>
                            <select
                                id="danger_category"
                                name="danger_category"
                                value={substance.danger_category}
                                onChange={handleChange}
                                className="form-select"
                            >
                                {dangerCategories.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label htmlFor="safety_sheet" className="form-label fw-bold">Bezpečnostní list</label>
                            <input
                                id="safety_sheet"
                                name="safety_sheet"
                                onChange={(e) => handleFileChange(e.target.files[0])}
                                type="file"
                                className="form-control"
                            />
                        </div>

                        {substanceId && substance.safety_sheet &&
                            <div className="col-md-2 flex-column align-content-end">
                                <a className="btn btn-light form-control " onClick={() => openSafetySheet(substanceId)}>💾</a>
                            </div>
                        }

                        {substance.safety_sheet && <div className="col-md-2">
                            <label htmlFor="safety_sheet_rev_date" className="form-label fw-bold">Datum revize</label>
                            <input
                                id="safety_sheet_rev_date"
                                name="safety_sheet_rev_date"
                                type="number"
                                value={substance.safety_sheet_rev_date}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>}

                        <div className="col-md-2">
                            <label htmlFor="unit" className="form-label fw-bold">Jednotka</label>
                            <select
                                id="unit"
                                name="unit"
                                value={substance.unit}
                                onChange={handleChange}
                                className="form-select"
                            >
                                {unitList.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="row mb-0">
                        <label className="form-label fw-bold col-md-3">Vlastnost</label>
                        <label className="form-label fw-bold col-md-2">Kategorie</label>
                        <label className="form-label fw-bold col-md-2">Typ expozice</label>
                    </div>
                    {substance.properties.map((property, index) => (
                        <div key={index} className="row mb-3">
                            <div className="col-md-3">
                                <input
                                    type="text"
                                    placeholder="Název vlastnosti"
                                    value={property.name}
                                    onChange={(e) => handlePropertyChange(index, "name", e.target.value)}
                                    className="form-control"
                                    list="datalistOptions"
                                />
                                <datalist id="datalistOptions">
                                    {propertyList.map((p) => (
                                        <option key={p.name} value={p.name}>
                                            {p.name}
                                        </option>
                                    ))}
                                </datalist>
                            </div>
                            <div className="col-md-2">
                                <select
                                    name="category"
                                    value={property.category}
                                    onChange={(e) => handlePropertyChange(index, "category", e.target.value)}
                                    className="form-select"
                                    disabled={propertyList.find(p => p.name === property.name)?.categories.length === 0}
                                >
                                    <option value="" disabled />
                                    {propertyList.find(p => p.name === property.name)?.categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <select
                                    name="exposure_route"
                                    value={property.exposure_route}
                                    onChange={(e) => handlePropertyChange(index, "exposure_route", e.target.value)}
                                    className="form-select"
                                    disabled={(propertyList.find(p => p.name === property.name)?.exposure_routes?.length ?? 0) === 0}
                                >
                                    <option value=""/>
                                    {propertyList.find(p => p.name === property.name)?.exposure_routes.map((exposure_route) => (
                                        <option key={exposure_route} value={exposure_route}>
                                            {exposure_route}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={() => removePropertyRow(index)}
                                    disabled={
                                    substance.properties.length === 1 &&
                                        !substance.properties[0].name &&
                                        !substance.properties[0].category
                                }
                                >
                                    Odebrat
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="d-flex justify-content-between">
                        <button
                            type="submit"
                            className="form-control btn bg-pink"
                        >
                            Uložit
                        </button>
                        {substanceId && <button
                            type="button"
                            className="form-control btn btn-outline-danger w-auto text-nowrap"
                            data-bs-toggle="modal"
                            data-bs-target="#deleteModal"
                        >
                            Odebrat
                        </button>}
                    </div>
                </form>
            </div>
            <Modal handleDelete={handleDelete}>
                Opravdu chceš odstranit <b>{substance.name}</b>?
            </Modal>
        </div>
    );
}

export default Substance;
