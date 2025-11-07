import { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import SelectPropertyAttribute from "../components/SelectPropertyAttribute.jsx";
import ImageUploadPreview from "../components/ImageUploadPreview.jsx";

function EditSubstance() {
    const { substance_id } = useParams();

    const navigate = useNavigate();

    const [substance, setSubstance] = useState({});
    const [propertyList, setPropertyList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [physicalFormList, setPhysicalFormList] = useState([]);


    useEffect(() => {
        axios.get(`/api/substances/${substance_id}`)
            .then(res => {
                setSubstance(res.data);
            })
    }, [substance_id]);

    useEffect(() => {
        axios.get("/api/properties")
            .then(res => {
                setPropertyList(res.data);
            })

        axios.get("/api/units")
            .then(res => {
                setUnitList(res.data);
            })
        axios.get("/api/physical_forms")
            .then(res => {
                setPhysicalFormList(res.data);
            })
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSubstance((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckbox = (e) => {
        const { name, checked } = e.target;
        setSubstance((prev) => ({ ...prev, [name]: checked }));
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.put(`/api/substances/${substance_id}`, substance)
        await navigate("/substances");
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h2 className="mb-4">Upravit látku</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="row mb-3">
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Název</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={substance.name}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Zadejte název látky"
                                    required
                                />
                            </div>

                            <div className="col-md-2">
                                <label className="form-label fw-bold">Látka/Směs</label>
                                <select
                                    name="substance_mixture"
                                    value={substance.substance_mixture}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="" disabled>-- Vyber --</option>
                                    <option value="látka">látka</option>
                                    <option value="směs">směs</option>
                                </select>
                            </div>

                            <div className="col-md-2">
                                <label className="form-label fw-bold">Fyzikální forma</label>
                                <select
                                    name="physical_form"
                                    value={substance.physical_form}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="" disabled>
                                        -- Vyber --
                                    </option>
                                    {physicalFormList.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-2">
                                <label className="form-label fw-bold">Jednotka</label>
                                <select
                                    name="unit"
                                    value={substance.unit}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="" disabled>
                                        -- Vyber --
                                    </option>
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
                                        name="iplp"
                                        checked={!!substance.iplp}
                                        onChange={handleCheckbox}
                                        className="form-check-input"
                                    />
                                    <label className="form-check-label fw-bold">IPLP</label>
                                </div>

                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        name="disinfection"
                                        checked={!!substance.disinfection}
                                        onChange={handleCheckbox}
                                        className="form-check-input"
                                    />
                                    <label className="form-check-label fw-bold">Dezinfekce</label>
                                </div>
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-4">
                                <ImageUploadPreview />
                            </div>
                            <div className="col-md-4"></div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold">Bezpečnostní list</label>
                                <input
                                    name="safety_sheet"
                                    type="file"
                                    className="form-control"
                                />
                            </div>
                        </div>

                        <div className="row mb-0">
                            <label className="form-label fw-bold col-md-3">Vlastnost</label>
                            <label className="form-label fw-bold col-md-2">Kategorie</label>
                            <label className="form-label fw-bold col-md-2">Typ expozice</label>
                        </div>

                        {substance.properties && substance.properties.map((property, i) => (
                            <div key={i} className="row mb-3">
                                <div className="col-md-3">
                                    <input
                                        type="text"
                                        placeholder="Název vlastnosti"
                                        value={property.name}
                                        onChange={(e) => handlePropertyChange(i, "name", e.target.value)}
                                        className="form-control"
                                        list="datalistOptions"
                                    />
                                    <datalist id="datalistOptions">
                                        {propertyList.map((prop) => (
                                            <option key={prop} value={prop}>
                                                {prop}
                                            </option>
                                        ))}
                                    </datalist>
                                </div>

                                <div className="col-md-2">
                                    <SelectPropertyAttribute
                                        endpoint={
                                            propertyList.includes(property.name)
                                                ? "categories/" + property.name
                                                : null
                                        }
                                        value={property.category}
                                        onChange={(newValue) => handlePropertyChange(i, "category", newValue)}
                                    />
                                </div>

                                <div className="col-md-2">
                                    <SelectPropertyAttribute
                                        endpoint={
                                            propertyList.includes(property.name)
                                                ? "exposure_routes/" + property.name
                                                : null
                                        }
                                        value={property.exposure_route}
                                        onChange={(newValue) =>
                                            handlePropertyChange(i, "exposure_route", newValue)
                                        }
                                    />
                                </div>

                                <div className="col text-end">
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger"
                                        onClick={() => removePropertyRow(i)}
                                        disabled={
                                            substance.properties.length === 1 &&
                                            !substance.properties[0].name &&
                                            !substance.properties[0].category &&
                                            !substance.properties[0].exposure_route
                                        }
                                    >
                                        Odebrat
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button type="submit" className="btn btn-primary w-100">
                            Uložit změny
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditSubstance;
