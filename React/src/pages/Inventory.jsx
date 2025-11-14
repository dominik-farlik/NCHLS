import React, {useEffect, useState} from "react";
import axios from "axios";
import {useParams} from "react-router-dom";
import Table from "../components/Table.jsx";
import THead from "../components/THead.jsx";

function Inventory() {
    const [records, setRecords] = useState([]);
    const { departmentName } = useParams()

    useEffect(() => {
        if (!departmentName) return;

        axios.get("/api/records", { params: { department_name: departmentName } })
            .then(async (response) => {
                setRecords(response.data);
            });
    }, [departmentName]);


    return (
        <div className="container mt-4 d-flex justify-content-center">
            <div className="card shadow-sm p-2 shadow-sm mb-2">
                <div className="card-body">
                    <h1 className="mb-4">{departmentName}</h1>
                    <Table>
                        <THead>
                            <th>Látka</th>
                            <th style={{ width: "28%" }}>Množství</th>
                            <th>Vlastnosti</th>
                        </THead>
                        <tbody>
                        {records.map((record) => (
                            <tr key={record._id?.$oid}>
                                <td style={{ fontWeight: "700" }}>
                                    {record.substance.name}</td>
                                <td className="align-middle">
                                    <div className="input-group">
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={record.amount}
                                            // onChange={...}
                                        />
                                        <span className="input-group-text">{record.substance?.unit || "ks"}</span>
                                    </div>
                                </td>
                                <td>
                                    {record.substance.properties.map((property, index) => (
                                        <div key={index}>
                                            {`${property.name} ${property.category} ${property.exposure_route ? `(${property.exposure_route})` : ""}`}
                                        </div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

export default Inventory;