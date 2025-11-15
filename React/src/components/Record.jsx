import {useEffect, useMemo, useState} from "react";
import axios from "axios";
import Modal from "./Modal.jsx";
import {useNavigate} from "react-router-dom";

function Record({ recordId, handleSubmit }) {
    const [record, setRecord] = useState({
        substance_id: '',
        amount: '',
        location_name: '',
        year: new Date().getFullYear(),
    });
    const navigate = useNavigate();
    const [substanceList, setSubstanceList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [substanceName, setSubstanceName] = useState("");

    useEffect(() => {
        axios.get("/api/substances")
            .then(res => {
                setSubstanceList(res.data);
            })
        axios.get("/api/departments")
            .then(res => {
                setDepartmentList(res.data);
            })
    }, []);

    useEffect(() => {
        if (!recordId) return;

        axios.get(`/api/records/${recordId}`)
            .then(async res => {
                const data = res.data;
                setRecord(data);
            });

    }, [recordId]);

    useEffect(() => {
        const selected = substanceList.find(substance => substance.name === substanceName);
        if (selected) {
            setRecord(prev => ({
                ...prev,
                substance_id: selected._id
            }));
        }
    }, [substanceName, substanceList]);

    useEffect(() => {
        if (!record.substance_id || !substanceList.length) return;
        const substance = substanceList.find(
            (s) => s._id.$oid === record.substance_id.$oid
        );
        setSubstanceName(substance?.name ?? "");
    }, [record.substance_id, substanceList]);

    function handleDelete() {
        axios.delete(`/api/records/${recordId}`)
            .then(() => {
                navigate("/records");
            })
    }

    const unit = useMemo(() => {
        const s = substanceList.find(substance => substance.name === substanceName);
        return s?.unit ?? "ks";
    }, [substanceName, substanceList]);


    const handleChange = (e) => {
        const { name, value } = e.target;

        setRecord((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h2 className="mb-4">Přidat záznam</h2>
                <form onSubmit={(e) => handleSubmit(e, record)}>
                    <div className="row mb-3">
                        <div className="col mb-3">
                            <label className="form-label fw-bold">Místo uložení</label>
                            <input
                                type="text"
                                name="location_name"
                                value={record.location_name}
                                onChange={handleChange}
                                className="form-control"
                                list="departmentList"
                                required
                            />
                            <datalist id="departmentList">
                                {departmentList.map((department) => (
                                    <option key={department.name} value={department.name}>
                                        {department.name}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                        <div className="col mb-3">
                            <label className="form-label fw-bold">Rok</label>
                            <input
                                type="number"
                                name="year"
                                value={record.year}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Látka</label>
                            <input
                                type="text"
                                name="substance_name"
                                value={substanceName}
                                onChange={(e) => setSubstanceName(e.target.value)}
                                className="form-control"
                                list="datalistOptions"
                                required
                            />
                            <datalist id="datalistOptions">
                                {substanceList.map((substance) => (
                                    <option key={substance.name} value={substance.name} />
                                ))}
                            </datalist>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label fw-bold">Množství</label>
                            <input
                                type="number"
                                step="1"
                                name="amount"
                                placeholder="0"
                                value={record.amount}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        { substanceName && <div className="col-md-1">
                            <label className="form-label fw-bold">Jednotka</label>
                            <input
                                value={unit}
                                className="form-control"
                                disabled
                            />
                        </div>}
                    </div>
                    <div className="d-flex justify-content-between">
                        <button
                            type="submit"
                            className="btn w-100"
                            style={{ backgroundColor: "pink" }}
                        >
                            Uložit
                        </button>
                        {recordId &&
                            <button
                                type="button"
                                className="form-control btn btn-outline-danger w-auto text-nowrap"
                                data-bs-toggle="modal"
                                data-bs-target="#deleteModal"
                            >
                                Odebrat
                            </button>
                        }
                    </div>
                </form>
            </div>
            <Modal handleDelete={handleDelete}>
                Opravdu chceš odstranit záznam?
            </Modal>
        </div>
    );
}

export default Record;