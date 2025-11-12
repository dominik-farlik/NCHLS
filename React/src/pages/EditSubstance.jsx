import { useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import Alert from "../components/Alert.jsx";
import Substance from "../components/Substance.jsx";
import axios from "axios";

function EditSubstance() {
    const { substance_id } = useParams();
    const [alert, setAlert] = useState({
        message: "",
        type: ""
    });

    const navigate = useNavigate();

    const handleSubmit = async (e, substance) => {
        e.preventDefault();

        const payload = {
            ...substance,
            safety_sheet: substance.safety_sheet?.name || '',
        };

        await axios.put("/api/substances", payload)
            .then(() => {
                navigate("/substances");
            })
            .catch(error => {
                setAlert({message: error.response.data.detail, type: "danger"});
            })

        if (substance.safety_sheet) {
            const formData = new FormData();
            formData.append("safety_sheet", substance.safety_sheet);

            await axios.post("/api/substances/safety_sheet", formData)
                .catch(error => {
                    console.log(error.response.data.detail)
                });
        }
    };

    return (
        <div className="container mt-4">
            <Alert message={alert.message} type={alert.type}/>
            <Substance
                substance_id={substance_id}
                setAlert={setAlert}
                handleSubmit={handleSubmit}
                heading={"Upravit látku"}
            />
        </div>
    );
}

export default EditSubstance;
