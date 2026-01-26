import { useState, useEffect } from "react";
import {NavLink, Outlet} from "react-router-dom";

const getInitialTheme = () => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;

    return document.body.getAttribute("data-bs-theme") || "light";
};

function Navbar() {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.body.setAttribute("data-bs-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg bg-pink">
                <div className="container-fluid">
                    <NavLink className="navbar-brand" to="/">
                        <img
                            src="/favicon.png"
                            alt="Logo"
                            height="35"
                            className="d-inline-block align-text-top"
                        />
                    </NavLink>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <NavLink
                                    className={({ isActive }) =>
                                        "nav-link nav-link-big" + (isActive ? " active fw-bold" : "")
                                    }
                                    to="/substances"
                                >
                                    Látky
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    className={({ isActive }) =>
                                        "nav-link nav-link-big" + (isActive ? " active fw-bold" : "")
                                    }
                                    to="/records"
                                >
                                    Záznamy
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    className={({ isActive }) =>
                                        "nav-link nav-link-big" + (isActive ? " active fw-bold" : "")
                                    }
                                    to="/departments"
                                >
                                    Inventura
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    <button className="btn ms-3 btn-outline-warning" onClick={toggleTheme}>
                        {theme === "light" ? "🌙" : "🌞"}
                    </button>
                </div>
            </nav>
            <Outlet />
        </>
    );
}

export default Navbar;
