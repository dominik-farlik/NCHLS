import { NavLink } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg"
            style={{ backgroundColor: "pink" }}
        >
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
                                    "nav-link" + (isActive ? " active" : "")
                                }
                                to="/substances"
                            >
                                Látky
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                className={({isActive}) =>
                                    "nav-link" + (isActive ? " active" : "")
                                }
                                to="/records"
                            >
                                Záznamy
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                className={({isActive}) =>
                                    "nav-link" + (isActive ? " active" : "")
                                }
                                to="/departments"
                            >
                                Oddělení
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
