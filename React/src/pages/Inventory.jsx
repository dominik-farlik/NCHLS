import React, { useEffect, useState } from "react";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import Table from "../components/Table.jsx";
import THead from "../components/THead.jsx";
import Spinner from "../components/Spinner.jsx";

function Inventory() {
    const [records, setRecords] = useState([]);
    const { departmentName } = useParams();
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [substanceList, setSubstanceList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [newRecord, setNewRecord] = useState({
        name: "",
        amount: "",
        unit: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("/api/substances").then((res) => {
            setSubstanceList(res.data);
        });
        axios.get("/api/units")
            .then(res => {
                setUnitList(res.data);
            })
    }, []);

    useEffect(() => {
        if (!departmentName) return;
        setLoading(true);
        axios
            .get("/api/records", {
                params: { department_name: departmentName },
            })
            .then((response) => {
                setRecords(response.data);
                const years = [...new Set(response.data.map((r) => r.year))];
                setYears(years);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [departmentName]);

    const handleChange = (e, index) => {
        const { name, value } = e.target;

        setRecords((prev) => {
            const newRecords = [...prev];
            newRecords[index] = {
                ...newRecords[index],
                [name]: value,
            };
            return newRecords;
        });
    };

    const handleYearChange = (e) => {
        setYear(e.target.value);
    };

    const handleNewRecord = () => {
        const substance = substanceList.find(sub => sub.name === newRecord.name);
        if (!substance) return;

        const newRecordObj = {
            substance,
            substance_id: substance.substance_id,
            amount: Number(newRecord.amount),
            year,
            location_name: departmentName,
        };

        setRecords(prev => [...prev, newRecordObj]);
        setNewRecord({name: "", amount: "", unit: ""});
    }

    const handleUnitChange = async (e, index) => {
        const newUnit = e.target.value;
        const oldSubstance = records[index].substance;

        setRecords(prev => {
            const copy = [...prev];
            copy[index] = {
                ...copy[index],
                substance: {
                    ...oldSubstance,
                    unit: newUnit,
                },
            };
            return copy;
        });

        const payload = {
            ...oldSubstance,
            unit: newUnit,
            substance_id: oldSubstance.id || oldSubstance.substance_id,
        };

        try {
            await axios.put("/api/substances", payload);
        } catch (err) {
            console.error(err);
            alert("Nepodařilo se uložit jednotku látky.");
        }
    };



    const handleSubmit = () => {
        const payload = records
            .map(r => ({
                substance_id: r.substance_id,
                amount: r.amount,
                year: year,
                location_name: departmentName,
            }));
        console.log(payload);
            axios.post("/api/records/inventory", payload)
        .then(() => {
            navigate("/departments");
        })
    }

    return (
        <div className="container mt-4 d-flex justify-content-center">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center w-100">
                    <Spinner />
                </div>
            ) : (
                <div className="card shadow-sm p-2 shadow-sm mb-2">
                    <div className="card-body">
                        <div className="row mb-4 align-items-center">
                            <h1 className="col-auto flex-grow-1">
                                {departmentName}
                            </h1>
                            <div className="col-auto">
                                <select
                                    id="year"
                                    className="form-control"
                                    value={year}
                                    onChange={handleYearChange}
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Table>
                            <THead>
                                <th>Látka</th>
                                <th style={{ width: "28%" }}>Množství</th>
                                <th>Vlastnosti</th>
                            </THead>
                            <tbody>
                                {records.map((record, index) => (
                                    <tr key={index}>
                                        <td style={{ fontWeight: "700" }}>
                                            {record.substance.name}
                                        </td>
                                        <td className="align-middle">
                                            <div className="input-group">
                                                <input
                                                    name="amount"
                                                    type="number"
                                                    className="form-control"
                                                    value={record.amount}
                                                    onChange={(e) => handleChange(e, index)}
                                                />
                                                <select
                                                    name="unit"
                                                    value={record.substance?.unit || "ks"}
                                                    onChange={(e) => handleUnitChange(e, index)}
                                                    className="form-select input-group-text"
                                                    style={{
                                                        maxWidth: "30%",
                                                        appearance: "none",
                                                        WebkitAppearance: "none",
                                                        MozAppearance: "none",
                                                        backgroundImage: "none",
                                                    }}
                                                >
                                                    {unitList.map((option) => (
                                                        <option key={option} value={option}>
                                                            {option}
                                                        </option>
                                                    ))}
                                                </select>

                                            </div>
                                        </td>
                                        <td>
                                            {record.substance.properties.map((property, idx) => (
                                                    <div key={idx}>
                                                        {`${property.name} ${property.category} ${
                                                            property.exposure_route
                                                                ? `(${property.exposure_route})`
                                                                : ""
                                                        }`}
                                                    </div>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td>
                                        <input
                                            name="name"
                                            className="form-control"
                                            list="substances"
                                            value={newRecord.name}
                                            onChange={(e) => {
                                                const substance = substanceList.find(sub => sub.name === e.target.value);
                                                setNewRecord({
                                                    ...newRecord,
                                                    name: e.target.value,
                                                    ...(substance ? { unit: substance.unit } : {})
                                                });
                                            }}
                                        />
                                        <datalist id="substances">
                                            {substanceList.map((substance) => (
                                                <option key={substance.name} value={substance.name}></option>
                                            ))}
                                        </datalist>
                                    </td>
                                    <td className="align-middle input-group">
                                        <input
                                            type="number"
                                            name="amount"
                                            className="form-control"
                                            value={newRecord.amount}
                                            onChange={(e) => {
                                                setNewRecord({
                                                    ...newRecord,
                                                    amount: e.target.value
                                                });
                                            }}
                                        />
                                        <span
                                            className="input-group-text"
                                            style={{ minWidth: "40px" }}
                                        >
                                            {newRecord?.unit || "ks"}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn bg-pink w-100 form-control"
                                            onClick={handleNewRecord}
                                        >
                                            Přidat látku
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                    <button
                        type="button"
                        className="btn bg-pink w-100"
                        onClick={handleSubmit}
                    >
                        Uložit stav oddělení
                    </button>
                </div>
            )}
        </div>
    );
}

export default Inventory;
