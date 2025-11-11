import { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import Alert from "../components/Alert.jsx";

function Substance({ substance_id, setAlert }) {
    const navigate = useNavigate();

    const [substance, setSubstance] = useState({
        name: '',
        unit: '',
        iplp: false,
        disinfection: false,
        substance_mixture: '',
        physical_form: '',
        properties: [{ name: '', category: '', exposure_route: ''}],
        safety_sheet: undefined,
    });
    const [propertyList, setPropertyList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [physicalFormList, setPhysicalFormList] = useState([]);


    useEffect(() => {
        axios.get(`/api/substances/${substance_id}`)
            .then(res => {
                const data = res.data;
                setSubstance({
                    ...data,
                    properties: [
                        ...(data.properties ?? []),
                        { name: '', category: '', exposure_route: '' }
                    ]
                });
            });

    }, [substance_id]);

    useEffect(() => {
        console.log(substance);
    }, [substance]);

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
        console.log(substance);
        await axios.put("/api/substances", substance)
            .then(() => {
                navigate("/substances");
            })
            .catch(error => {
                setAlert({message: error.response.data.detail, type: "danger"});
            })
    };

    return (
        <div className="container mt-4">
            <Alert message={alert.message} type={alert.type}/>
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
                                    <option value="" disabled />
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
                                        checked={substance.iplp}
                                        onChange={(e) =>
                                            setSubstance({
                                                ...substance,
                                                iplp: e.target.checked,
                                            })
                                        }
                                        className="form-check-input"
                                    />
                                    <label className="form-check-label fw-bold">IPLP</label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
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
                                    <label className="form-check-label fw-bold">Desinfekce</label>
                                </div>
                            </div>
                        </div>
                        <div className="row mb-3">
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
                                        <option value="" disabled />
                                        {propertyList.find(p => p.name === property.name)?.exposure_routes.map((exposure_route) => (
                                            <option key={exposure_route} value={exposure_route}>
                                                {exposure_route}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col text-end">
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

                        <button type="submit" className="btn btn-primary w-100">
                            Uložit změny
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Substance;
