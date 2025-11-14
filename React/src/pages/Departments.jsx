import React, {useEffect, useState} from "react";
import axios from "axios";
import {NavLink} from "react-router-dom";

function Departments() {
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        axios.get("/api/departments")
        .then((response) => {
            setDepartments(response.data);
        })
    }, [])

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-center">Vyber oddělení</h1>

            <div className="row row-cols-1 row-cols-md-3 g-3 mb-4">
                {departments.map((department) => (
                    <div className="col" key={department.name}>
                        <NavLink
                            to={`/inventory/${department.name}`}
                            className="text-decoration-none"
                        >
                            <div className="card h-100 shadow-sm border-0">
                                <div className="card-body text-center" style={{ backgroundColor: "rgba(253,190,201,0.15)" }}>
                                    <h5 className="card-title mb-0">
                                        {department.id && `${department.id}.`} {department.name}
                                    </h5>
                                </div>
                            </div>
                        </NavLink>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Departments;