import {useState} from 'react';
import Alert from "../components/Alert.jsx";
import Record from "../components/Record.jsx";
import api from "../api/axios.js";

function AddRecord() {
    const [alert, setAlert] = useState({
        message: "",
        type: ""
    });

    const handleSubmit = async (e, record) => {
        e.preventDefault();
        await api.post("/records", record)
            .then(() => {
                setAlert({message: "Záznam byl přidán", type: "success"});
            })
            .catch(error => {
                setAlert({message: error.response.data.detail, type: "danger"});
            })
    };

    return (
        <div className="container mt-4">
            <Alert message={alert.message}
                   type={alert.type}
                   onClose={() => setAlert({ message: "", type: "" })}
            />
            <Record handleSubmit={handleSubmit} />
        </div>
    );
}

export default AddRecord;
