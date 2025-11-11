import { useState } from "react";
import { useParams } from "react-router-dom";
import Alert from "../components/Alert.jsx";
import Substance from "./Substance.jsx";

function EditSubstance() {
    const { substance_id } = useParams();
    const [alert, setAlert] = useState({
        message: "",
        type: ""
    });

    return (
        <div className="container mt-4">
            <Alert message={alert.message} type={alert.type}/>
            <Substance substance_id={substance_id} setAlert={setAlert} />
        </div>
    );
}

export default EditSubstance;
