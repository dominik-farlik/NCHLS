import { useState } from 'react';

function RecordForm() {
    const [record, setRecord] = useState({
        name: '',
        amount: 0,
        location_name: '',
        year: 2025,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecord((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('http://localhost:8000/add_record', {
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
        <div className="container mt-5">
            <h2 className="mb-4">Přidat záznam</h2>
            <form onSubmit={handleSubmit} className="p-4 border rounded bg-light shadow-sm">
                <div className="mb-3">
                    <label className="form-label">Látka:</label>
                    <input
                        type="text"
                        name="name"
                        value={record.name}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Množství:</label>
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
                <div className="mb-3">
                    <label className="form-label">Místo uložení:</label>
                    <input
                        type="text"
                        name="location_name"
                        value={record.location_name}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Rok:</label>
                    <input
                        type="number"
                        name="year"
                        value={record.year}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Odeslat</button>
            </form>
        </div>
    );
}

export default RecordForm;
