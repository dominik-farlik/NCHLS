import { useEffect, useState } from 'react';

function SubstanceForm() {
    const [substance, setSubstance] = useState({
        name: '',
        physical_form: '',
        acute_toxicity: 0,
        properties: [],
        unit: '',
    });

    const [units, setUnits] = useState([]);
    const [loadingUnits, setLoadingUnits] = useState(true);
    const [vlastnosti, setVlastnosti] = useState([{ nazev: '', kategorie: '' }]);

    useEffect(() => {
        async function fetchUnits() {
            try {
                const response = await fetch('http://localhost:8000/units');
                if (!response.ok) throw new Error('Chyba při načítání jednotek');
                const data = await response.json();
                setUnits(data);
                substance.unit = units[0]
                setSubstance((prev) => ({
                    ...prev,
                    unit: data.length > 0 ? data[0] : '',
                }));
            } catch (error) {
                console.error(error);
                setUnits([]);
            } finally {
                setLoadingUnits(false);
            }
        }
        fetchUnits();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSubstance((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePropertyChange = (index, field, value) => {
        const newVlastnosti = [...vlastnosti];
        newVlastnosti[index][field] = value;
        setVlastnosti(newVlastnosti);

        // Update substance.properties properly
        setSubstance((prev) => ({
            ...prev,
            properties: newVlastnosti.filter(v => v.nazev.trim() && v.kategorie.trim())
        }));

        // Add new empty row if last one is filled
        if (
            index === vlastnosti.length - 1 &&
            newVlastnosti[index].nazev.trim() !== '' &&
            newVlastnosti[index].kategorie.trim() !== ''
        ) {
            setVlastnosti([...newVlastnosti, { nazev: '', kategorie: '' }]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:8000/add_substance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(substance),
        });
        const data = await response.json();
        console.log('Response:', data);
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Přidat látku</h2>
            <form onSubmit={handleSubmit} className="p-4 border rounded bg-light shadow-sm">
                <div className="mb-3">
                    <label className="form-label fw-bold">Název</label>
                    <input
                        type="text"
                        name="name"
                        value={substance.name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Zadejte název látky"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">Fyzikální forma</label>
                    <select
                        name="physical_form"
                        value={substance.physical_form}
                        onChange={handleChange}
                        className="form-select"
                        required
                    >
                        <option value="">Vyberte formu...</option>
                        <option value="Pevná">Pevná</option>
                        <option value="Kapalná">Kapalná</option>
                        <option value="Plynná">Plynná</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">Jednotka</label>
                    {loadingUnits ? (
                        <div className="form-text">Načítám jednotky...</div>
                    ) : (
                        <select
                            name="unit"
                            value={substance.unit}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            {units.map((unit) => (
                                <option key={unit} value={unit}>
                                    {unit}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold">Vlastnosti</label>
                    {vlastnosti.map((vlastnost, i) => (
                        <div key={i} className="row g-2 mb-2">
                            <div className="col-md-6">
                                <input
                                    type="text"
                                    placeholder="Název vlastnosti"
                                    value={vlastnost.nazev}
                                    onChange={(e) => handlePropertyChange(i, 'nazev', e.target.value)}
                                    className="form-control"
                                />
                            </div>
                            <div className="col-md-6">
                                <input
                                    type="text"
                                    placeholder="Kategorie"
                                    value={vlastnost.kategorie}
                                    onChange={(e) => handlePropertyChange(i, 'kategorie', e.target.value)}
                                    className="form-control"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <button type="submit" className="btn btn-primary w-100">Odeslat</button>
            </form>
        </div>
    );
}

export default SubstanceForm;
