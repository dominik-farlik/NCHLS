import { useEffect, useState } from 'react';

function RecordForm() {
    const [record, setRecord] = useState({
        substance_id: '',
        amount: 0,
        location_name: '',
        year: 2025,
    });

    const [substanceList, setsubstanceList] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState('');

    useEffect(() => {
        async function fetchsubstanceList() {
            try {
                const response = await fetch('http://localhost:8000/substances');
                if (!response.ok) throw new Error('Chyba při načítání vlastností');
                const data = await response.json();
                setsubstanceList(data);
            } catch (error) {
                console.error(error);
                setsubstanceList([]);
            }
        }
        fetchsubstanceList().catch(console.error);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'substance_id') {
            const selected = substanceList.find(s => s.substance_id === value);
            setSelectedUnit(selected ? selected.unit : '');
        }

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
                                    required
                                />
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
                                    name="substance_id"
                                    value={
                                        substanceList.find((s) => s._id.$oid === record.substance_id)?.name || ''
                                    }
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        const found = substanceList.find((s) => s.name === name);
                                        setRecord((prev) => ({
                                            ...prev,
                                            substance_id: found ? found._id.$oid : '',
                                        }));
                                    }}
                                    className="form-control"
                                    list="datalistOptions"
                                    required
                                />
                                <datalist id="datalistOptions">
                                    {substanceList.map((property) => (
                                        <option key={property._id.$oid} value={property.name} />
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
                            <div className="col d-flex align-items-end fw-bold">
                                {selectedUnit && <span className="form-label">{selectedUnit}</span>}
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary w-100">Odeslat</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RecordForm;
