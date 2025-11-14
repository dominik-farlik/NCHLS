import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AddButton from "../components/AddButton.jsx";
import Table from "../components/Table.jsx";
import THead from "../components/THead.jsx";

function Records() {
    const [allRecords, setAllRecords] = useState([]);
    const [records, setRecords] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [years, setYears] = useState([]);
    const [filter, setFilter] = useState({
        department: "",
        year: "",
    });

    useEffect(() => {
        axios.get("/api/records")
            .then(response => {
                const data = response.data;

                setAllRecords(data);
                setRecords(data);

                const departments = [...new Set(data.map(r => r.location_name))]
                setDepartments(departments);

                const years = [...new Set(data.map(r => r.year))]
                setYears(years);
            })
    }, []);

    function handleFilterChange(e) {
        const { id, value } = e.target;

        const updatedFilter = {
            ...filter,
            [id]: value
        };

        setFilter(updatedFilter);

        let filtered = [...allRecords];

        if (updatedFilter.department) {
            filtered = filtered.filter(r => r.location_name === updatedFilter.department);
        }

        if (updatedFilter.year) {
            filtered = filtered.filter(r => String(r.year) === String(updatedFilter.year));
        }

        setRecords(filtered);
    }

    return (
        <div className="container mt-4">
            <div className="row mb-4 align-items-center">
                <div className="col-auto align-self-end">
                    <AddButton endpoint="/add-record" />
                </div>
                <div className="col-md-3">
                    <label className="form-label fw-bold">Látka</label>
                    <input
                        type="text"
                        placeholder="Hledej ..."
                        //value={search}
                        //onChange={e => setSearch(e.target.value)}
                        className="form-control"
                        disabled
                    />
                </div>
                <div className="col-auto">
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
                            <option key={department} value={department}>{department}</option>
                        ))}
                    </select>
                </div>
            </div>
            <Table>
                <THead>
                    <th>Látka</th>
                    <th>Množství</th>
                    <th>Vlastnosti</th>
                </THead>
                <tbody>
                {records.map((record) => (
                    <tr key={record._id?.$oid}>
                        <td>{record.substance.name}</td>
                        <td>{record.amount} {record.substance.unit || "ks"}</td>
                        <td>
                            {record.substance.properties.map((property, index) => (
                                <div key={index}>
                                    {`${property.name} ${property.category} ${property.exposure_route ? `(${property.exposure_route})` : ""}`}
                                </div>
                            ))}
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
}

export default Records;
