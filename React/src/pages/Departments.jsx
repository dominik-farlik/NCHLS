import {useEffect, useState} from "react";
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
            <ul className="list-group w-50 mx-auto d-block text-center">
                {departments.map((department) => (
                    <li
                        key={department.name}
                        className="list-group-item border-0 p-0"
                    >
                        <NavLink
                            className="list-group-item list-group-item-action"
                            to={`/inventory/${department.name}`}
                        >
                            {department.id}. {department.name}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Departments;