import React, { useState, useEffect } from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from 'axios';
import {openSafetySheet} from "../utils/fileUtils.jsx";
import Spinner from "../components/Spinner.jsx";
import AddButton from "../components/AddButton.jsx";
import Table from "../components/Table.jsx";
import THead from "../components/THead.jsx";

function Substances() {
    const [substances, setSubstances] = useState([]);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios
            .get("/api/substances")
            .then(res => {
                setSubstances(res.data);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const lower = search.toLowerCase();
        const filteredList = substances.filter(substance =>
            substance.name.toLowerCase().includes(lower)
        );
        setFiltered(filteredList);
    }, [search, substances]);

    return (
        <div className="mt-4 px-5" style={{ display: "flex", flexDirection: "column", height: "90.5vh" }}>
            <div className="row align-items-center mb-3">
                <div className="col-auto">
                    <AddButton endpoint='/add-substance' />
                </div>
                <div className="col-auto">
                    <input
                        type="text"
                        placeholder="Hledej látku..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="form-control me-3"
                        style={{ width: "auto" }}
                    />
                </div>
            </div>
            <Table>
                <THead>
                    <th style={{ position: "sticky", left: "0" }}>Název</th>
                    <th>Látka/Směs</th>
                    <th>Fyzikální forma</th>
                    <th>IPLP</th>
                    <th>Dezinfekce</th>
                    <th>Vlastnosti</th>
                    <th title="Bezpečnostní list">BL</th>
                    <th>Max. sklad.</th>
                    <th>Kategorie nebezpečnosti</th>
                    <th>EC50</th>
                    <th>Jednotka</th>
                    <th>Oddělení</th>
                </THead>
                <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={12}>
                            <Spinner />
                        </td>
                    </tr>
                ) : (filtered.map((substance) => (
                    <tr key={substance._id.$oid}>
                        <td
                            style={{ maxWidth: "400px", fontWeight: "700", cursor: "pointer", position: "sticky", left: "0", backgroundColor: "rgba(253,190,201,0.15)" }}
                            onClick={() => {
                                navigate(`/edit-substance/${substance._id.$oid}`)
                            }}
                        >
                            {substance.name}
                        </td>
                        <td>{substance.substance_mixture ?? ""}</td>
                        <td>{substance.physical_form ?? ""}</td>
                        <td>{substance.iplp ? "ano" : "ne"}</td>
                        <td>{substance.disinfection ? "ano" : "ne"}</td>
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
                            style={substance.safety_sheet ? { cursor: "pointer" } : {}}
                        >
                            {substance.safety_sheet ? "💾" : ""}
                        </td>
                        <td
                            className="text-truncate text-end"
                            style={{ maxWidth: "50px" }}
                            title={substance.max_tons}
                        >
                            {substance.max_tons ? `${substance.max_tons} t` : ""}
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
                        <td>{substance.departments.map((department) => (
                            <div key={department}>{department}</div>
                        ))}
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </Table>
        </div>
    );
}

export default Substances;
