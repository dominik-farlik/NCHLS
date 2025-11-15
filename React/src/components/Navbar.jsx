import { NavLink } from "react-router-dom";

function Navbar() {
    const toggleTheme = () => {
        const current = document.body.getAttribute("data-bs-theme") || "light";
        document.body.setAttribute("data-bs-theme", current === "light" ? "dark" : "light");
    };

    return (
        <nav className="navbar navbar-expand-lg bg-pink">
            <div className="container-fluid">
                <NavLink className="navbar-brand" to="/">
                    <img src="/public/favicon.png" alt="Logo" height="35"
                         className="d-inline-block align-text-top"/>
                </NavLink>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink
                                className={({isActive}) =>
                                    "nav-link nav-link-big" + (isActive ? " active" : "")
                                }
                                to="/substances"
                            >
                                Látky
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                className={({isActive}) =>
                                    "nav-link nav-link-big" + (isActive ? " active" : "")
                                }
                                to="/records"
                            >
                                Záznamy
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                className={({isActive}) =>
                                    "nav-link nav-link-big" + (isActive ? " active" : "")
                                }
                                to="/departments"
                            >
                                Inventura
                            </NavLink>
                        </li>
                    </ul>
                </div>
                <button className="btn ms-3" onClick={toggleTheme}>
                    🌓
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
