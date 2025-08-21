import { useEffect, useState } from 'react';
import SelectPropertyAttribute from "./SelectPropertyAttribute.jsx";
import ListSelect from "./ListSelect.jsx";
import ImageUploadPreview from "./ImageUploadPreview.jsx";

function SubstanceForm() {
    const [substance, setSubstance] = useState({
        name: '',
        unit: '',
        iplp: false,
        disinfection: false,
        substance_mixture: '',
        physical_form: '',
        properties: [{ name: '', category: '', exposure_route: ''}],
        safety_sheet: undefined,
    });

    const [propertyList, setPropertyList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        async function fetchPropertyList() {
            try {
                const response = await fetch('http://localhost:8000/properties');
                if (!response.ok) throw new Error('Chyba při načítání vlastností');
                const data = await response.json();
                setPropertyList(data);
            } catch (error) {
                console.error(error);
                setPropertyList([]);
            }
        }
        fetchPropertyList().catch(console.error);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSubstance((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setSubstance((prev) => ({
            ...prev,
            [name]: files[0],
        }));
    };

    const handlePropertyChange = (index, field, value) => {
        const newProperties = [...substance.properties];
        newProperties[index] = {
            ...newProperties[index],
            [field]: value,
        };

        setSubstance((prev) => ({
            ...prev,
            properties: newProperties,
        }));

        if (
            index === newProperties.length - 1 &&
            newProperties[index].name.trim() !== ''
        ) {
            addPropertyRow();
        }
    };

    const addPropertyRow = () => {
        setSubstance((prev) => ({
            ...prev,
            properties: [...prev.properties, { name: '', category: '', exposure_route: '' }],
        }));
    };

    const removePropertyRow = (index) => {
        const updated = substance.properties.filter((_, i) => i !== index);
        setSubstance((prev) => ({
            ...prev,
            properties: updated.length > 0 ? updated : [{ name: '', category: '', exposure_route: '' }],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        let payload = { ...substance };

        try {
            payload.properties = payload.properties.filter(
                (p) => p.name.trim() !== ''
            );

            const response = await fetch('http://localhost:8000/add_substance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                setErrorMessage((await response.json()).detail);
                return;
            }

            const data = await response.json();
            setSuccessMessage('Látka byla úspěšně přidána.');

            if (substance.safety_sheet) {
                const substanceId = data.id;
                const fileFormData = new FormData();
                fileFormData.append('safety_sheet', substance.safety_sheet);

                const fileResponse = await fetch(`http://localhost:8000/${substanceId}/add_safety_sheet`, {
                    method: 'POST',
                    body: fileFormData,
                });

                if (!fileResponse.ok) {
                    const fileErrorText = await fileResponse.text();
                    setErrorMessage(`Nepodařilo se nahrát bezpečnostní list: ${fileErrorText}`);
                    return;
                }
            }
        } catch (err) {
            setErrorMessage(`Neočekávaná chyba: ${err.message}`);
        }
    };

    return (
        <div className="container mt-5">
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            <form onSubmit={handleSubmit} className="p-4 border rounded bg-light shadow-sm">
                <div className="row mb-3">
                    <div className="col-md-4">
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
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Látka/Směs</label>
                        <select
                            name="substance_mixture"
                            value={substance.substance_mixture}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="" disabled>-- Vyber --</option>
                            <option value="Látka">Látka</option>
                            <option value="Směs">Směs</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Fyzikální forma</label>
                        <select
                            name="physical_form"
                            value={substance.physical_form}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="" disabled>-- Vyber formu --</option>
                            <option value="Pevná">Pevná</option>
                            <option value="Kapalná">Kapalná</option>
                            <option value="Plynná">Plynná</option>
                            <option value="Prášek">Prášek</option>
                            <option value="Prášek">Aerosol</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <ListSelect
                            name="unit"
                            endpoint="units"
                            value={substance.unit}
                            label="Jednotka"
                            onChange={(newValue) => handleChange(newValue)}
                        />
                    </div>
                    <div className="col-md-2">
                        <div className="form-check">
                            <input
                                type="checkbox"
                                name="iplp"
                                checked={substance.iplp}
                                onChange={(e) =>
                                    setSubstance({
                                        ...substance,
                                        iplp: e.target.checked,
                                    })
                                }
                                className="form-check-input"
                            />
                            <label className="form-check-label fw-bold">IPLP</label>
                        </div>
                        <div className="form-check">
                            <input
                                type="checkbox"
                                name="disinfection"
                                checked={substance.disinfection}
                                onChange={(e) =>
                                    setSubstance({
                                        ...substance,
                                        disinfection: e.target.checked,
                                    })
                                }
                                className="form-check-input"
                            />
                            <label className="form-check-label fw-bold">Desinfekce</label>
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-4">
                        <ImageUploadPreview/>
                    </div>
                    <div className="col-md-4"></div>
                    <div className="col-md-4">
                        <label className="form-label fw-bold">Bezpečnostní list</label>
                        <input
                            name="safety_sheet"
                            type="file"
                            onChange={handleFileChange}
                            className="form-control"
                        />
                    </div>
                </div>
                    <div className="row mb-0">
                        <label className="form-label fw-bold col-md-3">Vlastnost</label>
                        <label className="form-label fw-bold col-md-2">Kategorie</label>
                        <label className="form-label fw-bold col-md-2">Typ expozice</label>
                    </div>
                    {substance.properties.map((property, i) => (
                        <div key={i} className="row mb-3">
                            <div className="col-md-3">
                                <input
                                    type="text"
                                    placeholder="Název vlastnosti"
                                    value={property.name}
                                    onChange={(e) => handlePropertyChange(i, "name", e.target.value)}
                                    className="form-control"
                                    list="datalistOptions"
                                />
                                <datalist id="datalistOptions">
                                    {propertyList.map((property) => (
                                        <option key={property} value={property}>
                                            {property}
                                        </option>
                                    ))}
                                </datalist>
                            </div>
                            <div className="col-md-2">
                                <SelectPropertyAttribute
                                    endpoint={
                                        propertyList.includes(property.name)
                                            ? "categories/" + property.name
                                            : null
                                    }
                                    value={property.category}
                                    onChange={(newValue) => handlePropertyChange(i, "category", newValue)}
                                />
                            </div>
                            <div className="col-md-2">
                                <SelectPropertyAttribute
                                    endpoint={
                                        propertyList.includes(property.name)
                                            ? "exposure_routes/" + property.name
                                            : null
                                    }
                                    value={property.exposure_route}
                                    onChange={(newValue) => handlePropertyChange(i, "exposure_route", newValue)}
                                />
                            </div>
                            <div className="col text-end">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={() => removePropertyRow(i)}
                                    disabled={
                                        substance.properties.length === 1 &&
                                        !substance.properties[0].name &&
                                        !substance.properties[0].category
                                    }
                                >
                                    Odebrat
                                </button>
                            </div>
                        </div>
                    ))}
                <button type="submit" className="btn btn-primary w-100">Přidat</button>
            </form>
        </div>
    );
}

export default SubstanceForm;
