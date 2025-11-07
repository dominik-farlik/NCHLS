import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Substances() {
    const [substances, setSubstances] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("/api/substances")
            .then(res => {
                setSubstances(res.data);
            })
    }, []);

    const asYesNo = (v) => (v ? "ano" : "ne");

    return (
        <div className="mt-4">
            <div className="table-responsive" style={{ maxHeight: "86vh", overflowY: "auto" }}>
                <table className="table table-hover align-middle table-bordered" style={{ position: "relative" }}>
                    <thead
                        className="table-light"
                        style={{
                            position: "sticky",
                            top: 0,
                        }}
                    >
                    <tr className="border" style={{ position: "sticky", top: "0" }}>
                        <th>Název</th>
                        <th>Látka/Směs</th>
                        <th>Fyzikální forma</th>
                        <th>IPLP</th>
                        <th>Dezinfekce</th>
                        <th>Vlastnosti</th>
                        <th>Bezpečnostní list</th>
                        <th>Max. sklad. v tunách</th>
                        <th>Kategorie nebezpečnosti</th>
                        <th>EC50</th>
                        <th>Jednotka</th>
                    </tr>
                    </thead>
                    <tbody>
                    {substances.map((substance) => {
                        return (
                            <tr key={substance._id.$oid} onClick={() => navigate(`/edit-substance/${substance._id.$oid}`)} style={{ cursor: "pointer" }}>
                                <td style={{ fontWeight: "700" }}>{substance.name}</td>
                                <td>{substance.substance_mixture ?? ""}</td>
                                <td>{substance.physical_form ?? ""}</td>
                                <td>{asYesNo(substance.iplp)}</td>
                                <td>{asYesNo(substance.disinfection)}</td>
                                <td>{substance.properties.map((property, index) => (
                                    <div key={index}>{property.name} {property.category}</div>))}
                                </td>
                                <td>{asYesNo(substance.safety_sheet)}</td>
                                <td>{substance.max_tons ?? ""}</td>
                                <td>{substance.danger_category ?? ""}</td>
                                <td style={{ textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", maxWidth: "120px" }}
                                    title={substance.water_toxicity_EC50}>
                                    {substance.water_toxicity_EC50 ?? ""}
                                </td>
                                <td>{substance.unit ?? ""}</td>
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
