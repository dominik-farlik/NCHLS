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
                <div className="row row-cols-1 row-cols-md-2 g-4">
                    {substances.map((substance, sIndex) => (
                        <div key={substance._id.$oid || sIndex} className="col">
                            <div className="card h-100">
                                <div className="card-header fw-bold d-flex justify-content-between align-items-center">
                                    {substance.name}
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
                                        <label
                                            className="btn mb-0 p-0"
                                            title="Přidat bezpečnostní list"
                                            style={{
                                                textDecoration: "none",
                                                cursor: "pointer",
                                                fontSize: "1.5rem",
                                            }}
                                        >
                                            ➕
                                            <input
                                                type="file"
                                                name="safety_sheet"
                                                onChange={(e) => handleFileChange(e, substance._id.$oid)}
                                                style={{ display: "none" }}
                                            />
                                        </label>
                                    )}
                                </div>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>Látka/Směs</span>
                                        <span>{substance.substance_mixture}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>Fyzikální forma</span>
                                        <span>{substance.physical_form}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>IPLP</span>
                                        <span>{substance.iplp ? "ano" : "ne"}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>Dezinfekce</span>
                                        <span>{substance.disinfection ? "ano" : "ne"}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        <span>Vlastnosti</span>
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
                                                    <li key={pIndex}>
                                                        <a className="dropdown-item" href="#">
                                                            {Object.values(property).join(" ")}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>Max. sklad. v tunách</span>
                                        <span>{substance.max_tons}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>Kategorie nebezpečnosti</span>
                                        <span>{substance.danger_category}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>EC50</span>
                                        <span>{substance.water_toxicity_EC50}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span>Jednotka</span>
                                        <span>{substance.unit}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SubstancePage;
