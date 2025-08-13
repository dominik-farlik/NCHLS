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
                    Přidat látku
                </NavLink>
            </li>
            <li className="nav-item">
                <NavLink
                    className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                    to="/add-record"
                >
                    Přidat záznam
                </NavLink>
            </li>
        </ul>
    );
}

export default Navbar;
