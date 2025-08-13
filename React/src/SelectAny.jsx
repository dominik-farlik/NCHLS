import {useEffect, useState} from "react";

function SelectAny({ endpoint, label, onChange, value }) {
    const [internalValue, setInternalValue] = useState(value || "");
    const [options, setOptions] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

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
                const response = await fetch(`http://localhost:8000/${endpoint}`);
                if (!response.ok) throw new Error("Chyba při načítání");
                const data = await response.json();
                setOptions(data);
            } catch (error) {
                console.error(error);
                setOptions([]);
            } finally {
                setLoadingOptions(false);
            }
        }

        fetchOptions();
    }, [endpoint]);

    const handleChange = (e) => {
        setInternalValue(e.target.value);
        if (onChange) onChange(e);
    };

    return(
        <div>
            <label className="form-label fw-bold">{label}</label>
            {loadingOptions ? (
                <div className="form-text">Načítám data...</div>
            ) : (
                <select
                    name={endpoint}
                    value={internalValue}
                    onChange={handleChange}
                    className="form-select"
                >
                    <option value="" disabled>
                        -- Vyber --
                    </option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}

export default SelectAny;