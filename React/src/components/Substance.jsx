import { useEffect, useState } from "react";
import {openSafetySheet} from "../utils/fileUtils.jsx";
import {useNavigate} from "react-router-dom";
import Modal from "./Modal.jsx";
import api from "../api/axios.js";

const defaultSubstance = {
    name: '',
    unit: '',
    iplp: false,
    disinfection: false,
    substance_mixture: '',
    physical_form: '',
    properties: [{ name: '', category: '', exposure_route: ''}],
    safety_sheet: undefined,
    safety_sheet_rev_date: '',
};

function Substance({ substanceId, handleSubmit, heading, resetSignal }) {
    const [substance, setSubstance] = useState(defaultSubstance);
    const [propertyList, setPropertyList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [physicalFormList, setPhysicalFormList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setSubstance(defaultSubstance);
    }, [resetSignal]);

    useEffect(() => {
        if (!substanceId) return;

        api.get(`/substances/${substanceId}`)
            .then(async res => {
                const data = res.data;

                let file = undefined;
                if (data.safety_sheet) {
                    const file_res = await api.get(`/substances/safety_sheet/${substanceId}`);
                    file = file_res.data;
                }

                setSubstance({
                    ...data,
                    properties: [
                        ...(data.properties ?? []).filter(p => p.name),
                        { name: '', category: '', exposure_route: '' }
                    ],
                    safety_sheet: file,
                });
            });
    }, [substanceId]);

    useEffect(() => {
        api.get("/properties")
            .then(res => {
                setPropertyList(res.data);
            })

        api.get("/units")
            .then(res => {
                setUnitList(res.data);
            })
        api.get("/physical_forms")
            .then(res => {
                setPhysicalFormList(res.data);
            })
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
                        <div className="col-md-2">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    id="iplp"
                                    name="iplp"
                                    checked={substance.iplp}
                                    onChange={(e) =>
                                        setSubstance({
                                            ...substance,
                                            iplp: e.target.checked,
                                        })
                                }
                                    className="form-check-input"
                                />
                                <label htmlFor="iplp" className="form-check-label fw-bold">IPLP</label>
                            </div>
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    id="disinfection"
                                    name="disinfection"
                                    checked={substance.disinfection}
                                    onChange={(e) =>
                                        setSubstance({
                                            ...substance,
                                            disinfection: e.target.checked,
                                        })
                                }
                                    className="form-check-input"
                                />
                                <label htmlFor="disinfection" className="form-check-label fw-bold">Desinfekce</label>
                            </div>
                        </div>
                    </div>
                    <div className="row mb-3">
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
                            <div className="col-md-1 flex-column align-content-end">
                                <a className="btn btn-light form-control" onClick={() => openSafetySheet(substanceId)}>💾</a>
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
                                    required={property.name}
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
                                    required={property.category}
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
