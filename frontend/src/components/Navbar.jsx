import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout, getStoredUsername } from "../utils/auth"; // uprav cestu podle projektu

const getInitialTheme = () => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return document.body.getAttribute("data-bs-theme") || "light";
};

function Navbar() {
    const [theme, setTheme] = useState(getInitialTheme);
    const [username, setUsername] = useState(getStoredUsername());
    const navigate = useNavigate();

    useEffect(() => {
        document.body.setAttribute("data-bs-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        const onAuthChange = () => setUsername(getStoredUsername());
        window.addEventListener("auth-token-changed", onAuthChange);
        window.addEventListener("storage", onAuthChange); // když se token změní v jiné záložce
        return () => {
            window.removeEventListener("auth-token-changed", onAuthChange);
            window.removeEventListener("storage", onAuthChange);
        };
    }, []);

    const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <>
            <nav className="navbar nav-underline navbar-expand-lg bg-pink sticky-top">
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

                    <div className="d-flex align-items-center gap-2">
                        {/* Theme toggle */}
                        <button className="btn btn-outline-warning" onClick={toggleTheme}>
                            {theme === "light" ? "🌙" : "🌞"}
                        </button>

                        {/* User dropdown */}
                        {username ? (
                            <div className="dropdown">
                                <button
                                    className="btn btn-outline-light dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {username}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    {/* sem můžeš později přidat "Profil", "Odhlásit všechna zařízení", ... */}
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                                            Odhlásit
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <NavLink className="btn btn-outline-secondary" to="/login">
                                Přihlásit
                            </NavLink>
                        )}
                    </div>
                </div>
            </nav>

            <Outlet />
        </>
    );
}

export default Navbar;
