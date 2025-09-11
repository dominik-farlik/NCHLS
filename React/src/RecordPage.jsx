import { useEffect, useState } from "react";

function RecordPage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecords().catch(console.error);
    }, []);

    const fetchRecords = async () => {
        try {
            const response = await fetch('http://localhost:8000/records');
            if (!response.ok) throw new Error('Chyba při načítání');
            const data = await response.json();
            setRecords(data);
        } catch (error) {
            console.error(error);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Načítám...</span>
                    </div>
                </div>
            ) : records.length === 0 ? (
                <div className="alert alert-warning text-center">Žádné záznamy k zobrazení.</div>
            ) : (
                <table className="table table-hover align-middle table-striped table-borderless">
                    <thead className="table-dark">
                        <tr>
                            <th>Místo uložení</th>
                            <th className="text-center">Rok</th>
                            <th className="text-center">Látka</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record, index) => (
                            <tr key={record._id?.$oid || index}>
                                <td>{record.location_name}</td>
                                <td className="text-center">{record.year}</td>
                                <td className="text-center">{record.substance_id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default RecordPage;
