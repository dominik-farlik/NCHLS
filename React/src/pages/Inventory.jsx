import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {useNavigate, useParams} from "react-router-dom";
import Table from "../components/Table.jsx";
import THead from "../components/THead.jsx";
import Spinner from "../components/Spinner.jsx";
import Modal from "../components/Modal.jsx";
import api from "../api/axios.js";

function Inventory() {
    const [records, setRecords] = useState([]);
    const { departmentName } = useParams();
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());
    const [substanceList, setSubstanceList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [responsibleEmployee, setResponsibleEmployee] = useState("");
    const [initialSnapshot, setInitialSnapshot] = useState(null);
    const pendingYearRef = useRef(null);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const allowNextPopRef = useRef(false);
    const currentPathRef = useRef(window.location.pathname + window.location.search);
    const [newRecord, setNewRecord] = useState({
        name: "",
        amount: 0,
        substance: null,
    });
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/substances").then((res) => {
            setSubstanceList(res.data);
        });
        api.get("/units")
            .then(res => {
                setUnitList(res.data);
            })
    }, []);

    useEffect(() => {
        if (!departmentName) return;
        setLoading(true);

        api.get("/records", {
            params: { department_name: departmentName, year: year },
            })
            .then((response) => {
                setRecords(response.data);

                const snap = stableStringify(normalizeRecords(response.data, departmentName, year));
                setInitialSnapshot(snap);
            })
            .finally(() => {
                setLoading(false);
            });

        api.get("/departments/by_name", { params: { name: departmentName }})
            .then((res) => {
                setResponsibleEmployee(res.data.responsible_employee || "");
            })
            .catch((err) => {
                console.error(err);
                setResponsibleEmployee("");
            });

    }, [departmentName, year]);

    function normalizeRecords(list, departmentName, year) {
        return (list || []).map((r) => ({
            id: r.id ?? null,
            substance_id: r.substance_id ?? r.substance?.substance_id ?? r.substance?.id ?? null,
            amount: Number(r.amount ?? 0),
            year: Number(r.year ?? year),
            location_name: r.location_name ?? departmentName,
            unit: r.substance?.unit ?? null,
        }))
            .sort((a, b) => String(a.substance_id).localeCompare(String(b.substance_id)));
    }

    function stableStringify(obj) {
        return JSON.stringify(obj);
    }

    const isDirty = useMemo(() => {
        if (!initialSnapshot) return false;
        const current = stableStringify(normalizeRecords(records, departmentName, year));
        return current !== initialSnapshot;
    }, [records, initialSnapshot, departmentName, year]);

    useEffect(() => {
        const handler = (e) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

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
        const nextYear = Number(e.target.value);

        if (isDirty) {
            pendingYearRef.current = nextYear;
            setShowUnsavedModal(true);
            return;
        }

        setYear(nextYear);
    };

    function discardChangesAndContinue() {
        setShowUnsavedModal(false);

        if (pendingYearRef.current != null) {
            setYear(pendingYearRef.current);
            pendingYearRef.current = null;
            return;
        }

        allowNextPopRef.current = true;
        window.history.back();
    }


    function stayHere() {
        setShowUnsavedModal(false);
        pendingYearRef.current = null;
    }

    function blockBackNavigation() {
        const current = currentPathRef.current;
        window.history.pushState(null, "", current);
    }

    const onPopState = useCallback(() => {
        if (!isDirty) {
            currentPathRef.current =
                window.location.pathname + window.location.search;
            return;
        }

        if (allowNextPopRef.current) {
            allowNextPopRef.current = false;
            currentPathRef.current =
                window.location.pathname + window.location.search;
            return;
        }

        blockBackNavigation();
        setShowUnsavedModal(true);
    }, [isDirty]);

    useEffect(() => {
        currentPathRef.current = window.location.pathname + window.location.search;

        if (isDirty) {
            window.history.pushState(null, "", currentPathRef.current);
        }

        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, [isDirty, onPopState]);

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
        setNewRecord({ name: "", amount: 0, substance: null });
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
            await api.put("/substances", payload);
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

        api.post("/records/inventory", payload)
            .then(() => {
                const snap = stableStringify(normalizeRecords(records, departmentName, year));
                setInitialSnapshot(snap);

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

        api.delete(`/records/${recordToDelete.id}`)
            .then(() => {
                setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
                setRecordToDelete(null);
            })
            .catch(err => {
                console.error(err);
                alert("Nepodařilo se odstranit záznam.");
            });
    }

    async function addResponsibleEmployee() {
        const employee = responsibleEmployee.trim();

        try {
            await api.post("/records/inventory/responsible_employee", {
                employee,
                department_name: departmentName,
            });
        } catch (err) {
            console.error(err);
            alert("Nepodařilo se uložit zodpovědného pracovníka.");
        }
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
                                <h1>{departmentName}</h1>
                            </div>

                            <div className="col-auto ms-auto d-flex gap-2">
                                <input
                                    id="responsible_employee"
                                    className="form-control"
                                    placeholder="Zodpovědný pracovník"
                                    value={responsibleEmployee}
                                    onChange={(e) => setResponsibleEmployee(e.target.value)}
                                    onBlur={addResponsibleEmployee}
                                />
                                <input
                                    id="year"
                                    type="number"
                                    className="form-control text-center"
                                    style={{ width: "100px" }}
                                    value={year}
                                    onChange={handleYearChange}
                                />
                            </div>
                        </div>
                        <Table>
                            <THead>
                                { departmentName === "OKL-diagnostika" && (
                                    <>
                                        <th>Kód</th>
                                        <th>Dodavatel</th>
                                    </>
                                )}
                                <th>Látka</th>
                                <th style={{ width: "28%" }}>Množství</th>
                                <th>Vlastnosti</th>
                                <th></th>
                            </THead>
                            <tbody>
                                {records.map((record, index) => (
                                    <tr key={index}>
                                        { departmentName === "OKL-diagnostika" && (
                                            <>
                                                <td>
                                                    {record.substance.code}
                                                </td>
                                                <td>
                                                    {record.substance.manufacturer}
                                                </td>
                                            </>
                                        )}
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
                                                className="btn btn-outline-danger w-100 form-control"
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
                                            className="btn btn-outline-success w-100 form-control"
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
            {showUnsavedModal && (
                <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Neuložené změny</h5>
                                <button type="button" className="btn-close" onClick={stayHere}></button>
                            </div>
                            <div className="modal-body">
                                Máš neuložené změny. Pokud budeš pokračovat, změny se zahodí.
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={stayHere}>
                                    Zůstat
                                </button>
                                <button className="btn btn-danger" onClick={discardChangesAndContinue}>
                                    Zahodit změny
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showUnsavedModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
}

export default Inventory;
