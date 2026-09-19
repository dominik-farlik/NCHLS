import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {openSafetySheet} from "../utils/fileUtils.jsx";
import Spinner from "../components/Spinner.jsx";
import AddButton from "../components/AddButton.jsx";
import Table from "../components/Table.jsx";
import THead from "../components/THead.jsx";
import api from "../api/axios.js";
import {substanceService} from "../api/substanceService.ts";
import type {SubstanceRead} from "../schemas/Substance.ts";

function Substances() {
    const [substances, setSubstances] = useState<SubstanceRead[]>();
    const [loading, setLoading] = useState(true);
    const [years, setYears] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [pages, setPages] = useState(1);
    const [limit, setLimit] = useState(0);
    const [page, setPage] = useState(0);
    const [orderBy, setOrderBy] = useState("name");
    const [sortDesc, setSortDesc] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState({
        department_name: undefined,
        year: undefined,
    });

    const navigate = useNavigate();

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
        setLoading(true);
        substanceService.getSubstances(page * limit, orderBy, sortDesc, filter.department_name, filter.year, search)
            .then(data => {
                setSubstances(data.items);
                setLimit(data.limit);
                setPages(Math.ceil(data.total / data.limit));
                console.log(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page, orderBy, sortDesc, filter.department_name, filter.year, search]);

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
                        onChange={e => {
                            setPage(0);
                            setSearch(e.target.value)
                        }}
                        className="form-control me-3"
                    />
                </div>
                <div className="col-md-3">
                    <label className="form-label fw-bold">Oddělení</label>
                    <select
                        id="department"
                        className="form-select"
                        value={filter.department_name}
                        onChange={(e)=> {
                            setPage(0);
                            setFilter({
                                ...filter,
                                department_name: e.target.value
                            });
                        }}
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
                        onChange={(e)=> {
                            setPage(0);
                            setFilter({
                                ...filter,
                                year: e.target.value
                            })
                        }}
                    >
                        <option value="">Vše</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>
            { pages > 1 &&
                <div className="d-flex flex-row gap-2 align-items-center justify-content-center mb-3">
                    {Array.from({ length: pages }).map((_, index) => (
                        <div
                            key={index}
                            className={`btn btn-outline-secondary ${page === index ? "active" : ""}`}
                            onClick={() => setPage(index)}
                        >
                            {index + 1}
                        </div>
                    ))}
                </div>
            }
            <Table>
                <THead>
                    <th
                        style={{ position: "sticky", left: "0", cursor: "pointer" }}
                        onClick={() => {
                            setOrderBy("name");
                            setSortDesc(!sortDesc);
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-center w-100">Název</span>
                            <span style={{ width: "20px", textAlign: "right" }}>
                                {orderBy === "name" ? (!sortDesc ? "▲" : "▼") : ""}
                            </span>
                        </div>
                    </th>
                    <th>Látka/Směs</th>
                    <th>Fyzikální forma</th>
                    <th>Doplňující forma</th>
                    <th>Vlastnosti</th>
                    <th title="Bezpečnostní list">
                        BL
                    </th>
                    <th title="Maximální skladované množství v tunách">
                        Max. sklad.
                    </th>
                    <th
                        className="text-truncate"
                        style={{ maxWidth: "80px" }}
                        title="Kategorie nebezpečnosti"
                    >
                        Kat. nebezpečnosti
                    </th>
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
                ) : (substances.map((substance) => (
                    <tr key={substance.id}>
                        <td
                            className="bg-pink"
                            style={{ maxWidth: "400px", fontWeight: "700", cursor: "pointer", position: "sticky", left: "0" }}
                            onClick={() => {
                                navigate(`/edit-substance/${substance.id}`)
                            }}
                        >
                            {substance.name}
                        </td>
                        <td>{substance.mixture ? "směs" : "látka"}</td>
                        <td>{substance.physical_form_name ?? ""}</td>
                        <td
                            className="text-truncate"
                            style={{ "maxWidth": "200px" }}
                        >
                            {substance.note && substance.note}
                        </td>
                        <td>
                            {substance.properties && substance.properties.map((property, index) => (
                                <div key={index} className="d-flex justify-content-between">
                                    <div>
                                        {`${property.name} ${property.category_name || ""} ${property.exposure_route_name ? `(${property.exposure_route_name})` : ""}`}
                                    </div>
                                    <div>
                                        {property.h_statement.map((statement, index) => (
                                            <div key={index}>{statement.code}</div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </td>
                        <td
                            onClick={() => substance.sds && openSafetySheet(substance.id)}
                            style={substance.sds ? { cursor: "pointer" } : {}}
                        >
                            {substance.sds ? "💾" : ""}
                        </td>
                        <td
                            className="text-truncate text-end"
                            style={{ maxWidth: "50px" }}
                        >
                            {substance.hazard_category.length > 0 && substance.hazard_category[0].max_amount_b + " t"}
                        </td>
                        <td className="text-truncate">
                            {substance.hazard_category.length > 0 && substance.hazard_category[0].code}
                        </td>
                        <td className="text-truncate"
                            style={{ maxWidth: "80px" }}
                            title={substance.water_toxicity_ec50}
                        >
                            {substance.water_toxicity_ec50 ?? ""}
                        </td>
                        <td
                            className="text-truncate"
                            style={{ maxWidth: "60px" }}
                            title={substance.unit_name}
                        >
                            {substance.unit_name ?? ""}
                        </td>
                        <td>
                            {substance.departments?.map((d, index) => (
                                <div
                                    key={index}
                                    title={d.department?.name}
                                >
                                    {d.department?.name}
                                </div>
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
