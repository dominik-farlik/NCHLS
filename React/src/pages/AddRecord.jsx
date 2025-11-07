import { useEffect, useState } from 'react';
import axios from "axios";

function AddRecord() {
    const [record, setRecord] = useState({
        substance_name: '',
        amount: 0,
        location_name: '',
        year: new Date().getFullYear(),
    });

    const [substanceList, setSubstanceList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [unit, setUnit] = useState('');

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

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "substance_name") {
            const selected = substanceList.find(substance => substance.name === value);
            if (selected?.unit) {
                setUnit(selected.unit);
            } else {
                setUnit("ks");
            }
        }
        setRecord((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('/api/add_record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(record),
        });

        const data = await response.json();
        console.log('Response:', data);
    };

    return (
        <div className="container mt-4">
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
                                    value={record.substance_name}
                                    onChange={handleChange}
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
                            { record.substance_name && <div className="col-md-1">
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
