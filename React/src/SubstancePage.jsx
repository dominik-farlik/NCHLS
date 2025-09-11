import React, { useEffect, useState } from "react";

function SubstancePage() {
    const [substances, setSubstances] = useState([]);
    const [loading, setLoading] = useState(true);

    const columnWidths = [
        '200px', // Název
        '120px', // Látka/Směs
        '140px', // Fyzikální forma
        '80px',  // IPLP
        '100px', // Dezinfekce
        '140px', // Vlastnosti
        '150px', // Bezpečnostní list
        '160px', // Max. sklad. v tunách
        '160px', // Kategorie nebezpečnosti
        '100px', // EC50
        '80px',  // Jednotka
    ];

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
                <div className="d-flex flex-column" style={{ overflowX: 'auto' }}>
                    <div className="d-flex bg-dark text-white fw-bold border-bottom">
                        <div className="p-2" style={{ flex: '0 0 ' + columnWidths[0] }}>Název</div>
                        <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[1] }}>Látka/Směs</div>
                        <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[2] }}>Fyzikální forma</div>
                        <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[3] }}>IPLP</div>
                        <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[4] }}>Dezinfekce</div>
                        <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[5] }}>Vlastnosti</div>
                        <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[6] }}>Bezpečnostní list</div>
                        <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[7] }}>Max. sklad. v tunách</div>
                        <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[8] }}>Kategorie nebezpečnosti</div>
                        <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[9] }}>EC50</div>
                        <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[10] }}>Jednotka</div>
                    </div>
                    {substances.map((substance, sIndex) => (
                        <div
                            key={substance._id.$oid || sIndex}
                            className={`d-flex align-items-center border-bottom ${sIndex % 2 ? "bg-light" : ""}`}
                        >
                            <div className="p-2 fw-bold" style={{ flex: '0 0 ' + columnWidths[0] }}>{substance.name}</div>
                            <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[1] }}>{substance.substance_mixture}</div>
                            <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[2] }}>{substance.physical_form}</div>
                            <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[3] }}>{substance.iplp ? "ano" : "ne"}</div>
                            <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[4] }}>{substance.disinfection ? "ano" : "ne"}</div>
                            <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[5] }}>
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
                            </div>
                            <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[6] }}>
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
                            <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[7] }}>{substance.max_tons}</div>
                            <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[8] }}>{substance.danger_category}</div>
                            <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[9] }}>{substance.water_toxicity_EC50}</div>
                            <div className="p-2 text-center" style={{ flex: '0 0 ' + columnWidths[10] }}>{substance.unit}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SubstancePage;
