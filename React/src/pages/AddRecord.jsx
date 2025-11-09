import {useEffect, useMemo, useState} from 'react';
import axios from "axios";
import Alert from "../components/Alert.jsx";

function AddRecord() {
    const [record, setRecord] = useState({
        substance_id: '',
        amount: 0,
        location_name: '',
        year: new Date().getFullYear(),
    });

    const [substanceList, setSubstanceList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [alert, setAlert] = useState({
        message: "",
        type: ""
    });
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
        const selected = substanceList.find(s => s.name === substanceName);
        if (selected) {
            setRecord(prev => ({
                ...prev,
                substance_id: selected._id.$oid
            }));
        }
    }, [substanceName, substanceList]);


    const unit = useMemo(() => {
        const s = substanceList.find(x => x.name === substanceName);
        return s?.unit ?? "ks";
    }, [substanceName, substanceList]);


    const handleChange = (e) => {
        const { name, value } = e.target;

        setRecord((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post("/api/records", record)
            .then(() => {
                setAlert({message: "Záznam byl přidán", type: "success"});
            })
            .catch(error => {
                setAlert({message: error.response.data.detail, type: "danger"});
            })
    };

    return (
        <div className="container mt-4">
            <Alert message={alert.message} type={alert.type}/>
            <div className="card shadow-sm">
                <div className="card-body">
                    <h2 className="mb-4">Přidat záznam</h2>
                    <form onSubmit={handleSubmit}>
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
                                    {substanceList.map((property) => (
                                        <option key={property.name} value={property.name} />
                                    ))}
                                </datalist>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label fw-bold">Množství</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="amount"
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
                        <button type="submit" className="btn btn-primary w-100">Odeslat</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddRecord;
