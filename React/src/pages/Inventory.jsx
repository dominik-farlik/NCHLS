import React, { useEffect, useState } from "react";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import Table from "../components/Table.jsx";
import THead from "../components/THead.jsx";
import Spinner from "../components/Spinner.jsx";
import Modal from "../components/Modal.jsx";

function Inventory() {
    const [records, setRecords] = useState([]);
    const { departmentName } = useParams();
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [substanceList, setSubstanceList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [newRecord, setNewRecord] = useState({
        name: "",
        substance: null,
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
                params: {
                    department_name: departmentName,
                    year: year
                },
            })
            .then((response) => {
                setRecords(response.data);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [departmentName, year]);

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
        setNewRecord({ name: "", substance: null });
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
                id: r.id,
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

    function handleDelete() {
        if (!recordToDelete) return;

        if (!recordToDelete.id) {
            setRecords(prev => prev.filter(r => r !== recordToDelete));
            setRecordToDelete(null);
            return;
        }

        axios.delete(`/api/records/${recordToDelete.id}`)
            .then(() => {
                setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
                setRecordToDelete(null);
            })
            .catch(err => {
                console.error(err);
                alert("Nepodařilo se odstranit záznam.");
            });
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
                            <div className="col-auto">
                                <h1>
                                    {departmentName}
                                </h1>
                            </div>
                            <div className="col-auto ms-auto">
                                <input
                                    id="year"
                                    className="form-control text-center"
                                    style={{ width: "100px" }}
                                    value={year}
                                    type="number"
                                    onChange={handleYearChange}
                                >
                                </input>
                            </div>
                        </div>
                        <Table>
                            <THead>
                                <th>Látka</th>
                                <th style={{ width: "28%" }}>Množství</th>
                                <th>Vlastnosti</th>
                                <th></th>
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
                                                    className="form-select input-group-text text-center"
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
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-danger w-100 form-control"
                                                onClick={() => setRecordToDelete(record)}
                                                data-bs-toggle="modal"
                                                data-bs-target="#deleteModal"
                                            >
                                                Odstranit
                                            </button>
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
                                                    substance: substance || null,
                                                });
                                            }}
                                        />
                                        <datalist id="substances">
                                            {substanceList.map((substance) => (
                                                <option key={substance.name} value={substance.name}></option>
                                            ))}
                                        </datalist>
                                    </td>
                                    <td className="align-middle align-middle">
                                        <div className="input-group">
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
                                                className="input-group-text d-flex justify-content-center align-items-center"
                                                style={{ width: "30%" }}
                                            >
                                                {newRecord.substance?.unit || "ks"}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        {newRecord.substance?.properties?.map((property, idx) => (
                                            <div key={idx}>
                                                {`${property.name} ${property.category} ${
                                                    property.exposure_route ? `(${property.exposure_route})` : ""
                                                }`}
                                            </div>
                                        ))}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-success w-100 form-control"
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
            <Modal handleDelete={handleDelete}>
                Opravdu chceš odstranit záznam?
            </Modal>
        </div>
    );
}

export default Inventory;
