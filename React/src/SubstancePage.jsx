import React, { useEffect, useState } from "react";

function SubstancePage() {
    const [substances, setSubstances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPropertyList().catch(console.error);
    }, []);

    const fetchPropertyList = async () => {
        try {
            const response = await fetch('http://localhost:8000/substances');
            if (!response.ok) throw new Error('Chyba při načítání');
            const data = await response.json();
            setSubstances(data);
        } catch (error) {
            console.error(error);
            setSubstances([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e, substanceId) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("safety_sheet", file);

        try {
            const response = await fetch(`http://localhost:8000/${substanceId}/add_safety_sheet`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Chyba při nahrávání: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("✅ Soubor nahrán:", result);

            setSubstances(prev =>
                prev.map(sub =>
                    sub._id.$oid === substanceId
                        ? { ...sub, safety_sheet: true }
                        : sub
                )
            );

        } catch (err) {
            console.error("❌ Nepodařilo se nahrát soubor:", err);
        }
    };

    return (
        <div className="container mt-4">
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Načítám...</span>
                    </div>
                </div>
            ) : substances.length === 0 ? (
                <div className="alert alert-warning text-center">Žádná data k zobrazení.</div>
            ) : (
                <table className="table table-hover align-middle table-striped table-borderless">
                    <thead className="table-dark">
                    <tr>
                        <th>Název</th>
                        <th className="text-center">Fyzikální forma</th>
                        <th className="text-center">Vlastnosti</th>
                        <th className="text-center">Bezpečnostní list</th>
                        <th className="text-center">Jednotka</th>
                    </tr>
                    </thead>
                    <tbody>
                    {substances.map((substance, sIndex) => (
                        <tr key={substance._id.$oid || sIndex}>
                            <td>{substance.name}</td>
                            <td className="text-center">{substance.physical_form}</td>
                            <td className="text-center">
                                <div className="btn-group">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm dropdown-toggle"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        Vlastnosti
                                    </button>
                                    <ul className="dropdown-menu">
                                        {substance.properties.map((property, pIndex) => (
                                            <li key={`${property.name}-${pIndex}`}>
                                                <a className="dropdown-item" href="#">
                                                    {property.name} ({property.category})
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </td>
                            <td className="text-center">
                                {substance.safety_sheet ? (
                                    <a
                                        href={`http://localhost:8000/safety_sheet/${substance._id.$oid}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Otevřít bezpečnostní list"
                                        style={{
                                            textDecoration: "none",
                                            cursor: "pointer",
                                            fontSize: "1.5rem",
                                        }}
                                    >
                                        📄
                                    </a>
                                ) : (
                                    <label className="btn"
                                           style={{
                                                textDecoration: "none",
                                                cursor: "pointer",
                                                fontSize: "1.5rem",
                                               padding: "0",
                                           }}>
                                        ➕
                                        <input
                                            type="file"
                                            name="safety_sheet"
                                            title="Přidat bezpečnostní list"
                                            onChange={(e) => handleFileChange(e, substance._id.$oid)}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </td>
                            <td className="text-center">{substance.unit}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default SubstancePage;
