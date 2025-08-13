import { useEffect, useState } from "react";

function SelectCategory({ endpoint, value, onChange }) {
    const [options, setOptions] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [internalValue, setInternalValue] = useState(value || "");

    useEffect(() => {
        if (!endpoint) {
            setOptions([]);
            setInternalValue("");
            if (onChange) onChange("");
            return;
        }

        async function fetchOptions() {
            setLoadingOptions(true);
            try {
                const response = await fetch(`http://localhost:8000/categories/${endpoint}`);
                if (!response.ok) throw new Error("Chyba při načítání");
                const data = await response.json();
                setOptions(data);
                if (data.length > 0) {
                    setInternalValue(data[0]);
                    if (onChange) onChange(data[0]);
                }
            } catch (error) {
                console.error(error);
                setOptions([]);
            } finally {
                setLoadingOptions(false);
            }
        }

        fetchOptions();
    }, [endpoint]);

    useEffect(() => {
        setInternalValue(value || "");
    }, [value]);

    const handleChange = (e) => {
        setInternalValue(e.target.value);
        if (onChange) onChange(e.target.value);
    };

    return (
        <div>
            {loadingOptions ? (
                <div className="form-text">Načítám...</div>
            ) : (
                <select
                    name="unit"
                    value={internalValue}
                    onChange={handleChange}
                    className="form-select"
                    required
                    disabled={options.length === 0}
                >
                    {options.map((unit) => (
                        <option key={unit} value={unit}>
                            {unit}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}

export default SelectCategory;
