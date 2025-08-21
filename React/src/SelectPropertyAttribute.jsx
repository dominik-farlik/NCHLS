import { useEffect, useState } from "react";

function SelectPropertyAttribute({ endpoint, value, onChange }) {
    const [options, setOptions] = useState([]);
    const [internalValue, setInternalValue] = useState(value || "");

    useEffect(() => {
        if (!endpoint) {
            setOptions([]);
            setInternalValue("");
            if (onChange) onChange("");
            return;
        }

        async function fetchOptions() {
            try {
                const response = await fetch(`http://localhost:8000/${endpoint}`);
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
                <select
                    name="option"
                    value={internalValue}
                    onChange={handleChange}
                    className="form-select"
                    required
                    disabled={options.length === 0}
                >
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
        </div>
    );
}

export default SelectPropertyAttribute;
