import { NavLink } from "react-router-dom";

function Navbar() {
    return (
        <ul className="nav nav-underline nav-fill">
            <li className="nav-item">
                <NavLink
                    className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                    to="/"
                >
                    Home
                </NavLink>
            </li>
            <li className="nav-item">
                <NavLink
                    className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                    to="/add-substance"
                >
                    Add substance
                </NavLink>
            </li>
            <li className="nav-item">
                <NavLink
                    className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                    to="/add-record"
                >
                    Add record
                </NavLink>
            </li>
        </ul>
    );
}

export default Navbar;
