import React, { useState, useEffect } from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from 'axios';

function Substances() {
    const [substances, setSubstances] = useState([]);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState([]);

    useEffect(() => {
        axios.get("/api/substances")
            .then(res => {
                setSubstances(res.data);
            })
    }, []);

    useEffect(() => {
        const lower = search.toLowerCase();
        const filteredList = substances.filter(substance =>
            substance.name.toLowerCase().includes(lower)
        );
        setFiltered(filteredList);
    }, [search, substances]);

    function openSafetySheet(substance_id) {
        window.open(`/api/substances/safety_sheet/${substance_id}`);
    }

    const asYesNo = (v) => (v ? "ano" : "ne");

    return (
        <div className="mt-4 px-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                    type="text"
                    placeholder="Hledej látku..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="form-control me-3"
                    style={{ width: "auto" }}
                />
                <Link
                    to="/add-substance"
                    className="btn btn-primary btn-block"
                >
                    Přidat
                </Link>
            </div>
            <div className="table-responsive border-top border-2 border-light" style={{ maxHeight: "79vh", overflowY: "auto" }}>
                <table className="table table-hover align-middle table-bordered" style={{ position: "relative" }}>
                    <thead
                        className="table-light"
                        style={{
                            position: "sticky",
                            top: 0,
                        }}
                    >
                    <tr style={{ position: "sticky", top: "0" }}>
                        <th>Název</th>
                        <th>Látka/Směs</th>
                        <th>Fyzikální forma</th>
                        <th>IPLP</th>
                        <th>Dezinfekce</th>
                        <th>Vlastnosti</th>
                        <th title="Bezpečnostní list">BL</th>
                        <th>Max. sklad. v tunách</th>
                        <th>Kategorie nebezpečnosti</th>
                        <th>EC50</th>
                        <th>Jednotka</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered.map((substance) => {
                        return (
                            <tr key={substance._id.$oid}>
                                <td
                                    style={{ maxWidth: "400px", fontWeight: "700", cursor: "pointer" }}
                                    onClick={() => {
                                        navigate(`/edit-substance/${substance._id.$oid}`)
                                    }}
                                >
                                    {substance.name}
                                </td>
                                <td>{substance.substance_mixture ?? ""}</td>
                                <td>{substance.physical_form ?? ""}</td>
                                <td>{asYesNo(substance.iplp)}</td>
                                <td>{asYesNo(substance.disinfection)}</td>
                                <td>
                                    {substance.properties.map((property, index) => (
                                    <div key={index}>
                                        {`${property.name} ${property.category} ${property.exposure_route ? `(${property.exposure_route})` : ""}`}
                                    </div>
                                ))}
                                </td>
                                <td
                                    onClick={() => substance.safety_sheet && openSafetySheet(substance._id.$oid)}
                                    title={substance.safety_sheet}
                                    style={substance.safety_sheet && { cursor: "pointer" }}
                                >
                                    {substance.safety_sheet ? "💾" : ""}
                                </td>
                                <td
                                    className="text-truncate"
                                    style={{ maxWidth: "50px" }}
                                    title={substance.max_tons}
                                >
                                    {substance.max_tons ?? ""}
                                </td>
                                <td
                                    className="text-truncate"
                                    style={{ maxWidth: "60px" }}
                                    title={substance.danger_category}
                                >
                                    {substance.danger_category ?? ""}
                                </td>
                                <td className="text-truncate"
                                    style={{ maxWidth: "80px" }}
                                    title={substance.water_toxicity_EC50}
                                >
                                    {substance.water_toxicity_EC50 ?? ""}
                                </td>
                                <td
                                    className="text-truncate"
                                    style={{ maxWidth: "60px" }}
                                    title={substance.unit}
                                >{substance.unit ?? ""}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Substances;
