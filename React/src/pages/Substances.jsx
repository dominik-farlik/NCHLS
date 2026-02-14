import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {openSafetySheet} from "../utils/fileUtils.jsx";
import Spinner from "../components/Spinner.jsx";
import AddButton from "../components/AddButton.jsx";
import Table from "../components/Table.jsx";
import THead from "../components/THead.jsx";
import api from "../api/axios.js";

const FILTER_STORAGE_KEY = "substances_filters_v1";

function loadFilter() {
    try {
        const raw = localStorage.getItem(FILTER_STORAGE_KEY);
        if (!raw) return { department: "", year: "" };
        const parsed = JSON.parse(raw);
        return {
            department: parsed?.department ?? "",
            year: parsed?.year ?? "",
        };
    } catch {
        return { department: "", year: "" };
    }
}

function Substances() {
    const [substances, setSubstances] = useState([]);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [years, setYears] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filter, setFilter] = useState(() => loadFilter());

    useEffect(() => {
        api.get("/departments")
            .then((response) => {
                setDepartments(response.data);
            })
        api.get("/records/years")
            .then((response) => {
                setYears(response.data);
            })
    }, []);

    useEffect(() => {
        const lower = search.toLowerCase();
        const filteredList = substances.filter(substance =>
            substance.name.toLowerCase().includes(lower)
        );
        setFiltered(filteredList);
    }, [search, substances]);

    useEffect(() => {
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filter));
    }, [filter]);

    useEffect(() => {
        setLoading(true);

        const params = {};
        if (filter.department) params.department_name = filter.department;
        if (filter.year) params.year = filter.year;

        api.get("/substances", { params })
            .then(res => setSubstances(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [filter.department, filter.year]);

    function handleFilterChange(e) {
        const { id, value } = e.target;

        setFilter(prev => ({
            ...prev,
            [id]: value
        }));
    }

    function downloadSummary() {
        const params = {};
        if (filter.department) params.department_name = filter.department;
        if (filter.year) params.year = filter.year;

        api.get("/substances/export.csv", { params, responseType: "blob" })
            .then((res) => {
                const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });

                const cd = res.headers["content-disposition"] || "";
                const match = cd.match(/filename="([^"]+)"/);
                const filename = match?.[1] ?? "substances.csv";

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(console.error);
    }

    return (
        <div className="mt-4 px-5 flex-column" style={{ display: "flex", height: "calc(100vh - 88px)" }}>
            <div className="row align-items-center mb-3 justify-content-between">
                <div className="col-auto align-self-end">
                    <AddButton endpoint='/add-substance' />
                </div>
                <div className="col-md-3">
                    <label className="form-label fw-bold">Látka</label>
                    <input
                        type="text"
                        placeholder="Hledej látku..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="form-control me-3"
                    />
                </div>
                <div className="col-md-3">
                    <label className="form-label fw-bold">Oddělení</label>
                    <select
                        id="department"
                        className="form-select"
                        value={filter.department}
                        onChange={handleFilterChange}
                    >
                        <option value="">Vše</option>
                        {departments.map(department => (
                            <option key={department.name} value={department.name}>{department.name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-2">
                    <label className="form-label fw-bold">Rok</label>
                    <select
                        id="year"
                        className="form-control"
                        value={filter.year}
                        onChange={handleFilterChange}
                    >
                        <option value="">Vše</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div className="col-auto align-self-end">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={downloadSummary}
                    >
                        Export do csv
                    </button>
                </div>
            </div>
            <Table>
                <THead>
                    <th style={{ position: "sticky", left: "0" }}>Název</th>
                    <th>Látka/Směs</th>
                    <th>Fyzikální forma</th>
                    <th>Doplňující forma</th>
                    <th>Vlastnosti</th>
                    <th>H-věty</th>
                    <th title="Bezpečnostní list">
                        BL
                    </th>
                    <th title="Maximální skladované množství v tunách">
                        Max. sklad.
                    </th>
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
                    <tr key={substance.substance_id}>
                        <td
                            className="bg-pink"
                            style={{ maxWidth: "400px", fontWeight: "700", cursor: "pointer", position: "sticky", left: "0" }}
                            onClick={() => {
                                navigate(`/edit-substance/${substance.substance_id}`)
                            }}
                        >
                            {substance.name}
                        </td>
                        <td>{substance.substance_mixture ?? ""}</td>
                        <td>{substance.physical_form ?? ""}</td>
                        <td
                            className="text-truncate"
                            style={{ "maxWidth": "200px" }}
                            title={substance.form_addition.join(", ")}
                        >
                            {substance.form_addition.join(", ")}
                        </td>
                        <td>
                            {substance.properties.map((property, index) => (
                                <div key={index}>
                                    {`${property.name} ${property.category} ${property.exposure_route ? `(${property.exposure_route})` : ""}`}
                                </div>
                            ))}
                        </td>
                        <td
                            className=""
                            style={{ "maxWidth": "200px" }}
                            title={substance.h_phrases?.join(", ")}
                        >
                            {substance.h_phrases?.join(", ")}
                        </td>
                        <td
                            onClick={() => substance.safety_sheet && openSafetySheet(substance.substance_id)}
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
                        >
                            {substance.unit ?? ""}
                        </td>
                        <td style={{ maxWidth: "400px" }}>
                            {substance.departments?.join(", ")}
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
