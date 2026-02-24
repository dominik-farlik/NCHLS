import Alert from "../components/Alert.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {useState} from "react";
import Record from "../components/Record.jsx";
import api from "../api/axios.js";

function EditRecord() {
    const { recordId } = useParams();
    const [alert, setAlert] = useState({
        message: "",
        type: ""
    });
    const navigate = useNavigate();

    const handleSubmit = async (e, record) => {
        e.preventDefault();

        const payload = {
            ...record,
            substance_id: record.substance_id,
        };

        await api.put("/records", payload)
            .then(() => {
                navigate("/records");
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
            <Record
                recordId={recordId}
                handleSubmit={handleSubmit}
            />
        </div>
    );
}

export default EditRecord;