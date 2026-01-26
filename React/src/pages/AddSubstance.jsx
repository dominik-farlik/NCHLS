import { useState } from 'react';
import Alert from "../components/Alert.jsx";
import Substance from "../components/Substance.jsx";
import api from "../api/axios.js";

function AddSubstance() {
    const [alert, setAlert] = useState({
        message: "",
        type: ""
    });
    const [resetSignal, setResetSignal] = useState(false);

    const handleSubmit = async (e, substance) => {
        e.preventDefault();

        const payload = {
            ...substance,
            safety_sheet: substance.safety_sheet?.name || '',
        };

        await api.post("/substances", payload)
        .then(() => {
            setAlert({message: "Látka byla přidána", type: "success"});
            setResetSignal(prev => !prev);
        })
        .catch(error => {
            setAlert({message: error.response.data.detail, type: "danger"});
        })

        if (substance.safety_sheet) {
            const formData = new FormData();
            formData.append("safety_sheet", substance.safety_sheet);

            await api.post("/substances/safety_sheet", formData)
                .catch(error => {
                    console.log(error.response.data.detail)
                });
        }
    };

    return (
        <div className="container mt-4">
            <Alert message={alert.message}
                   type={alert.type}
                   onClose={() => setAlert({ message: "", type: "" })}
            />
            <Substance
                handleSubmit={handleSubmit}
                heading={"Přidat látku"}
                resetSignal={resetSignal}
            />
        </div>
    );
}

export default AddSubstance;
