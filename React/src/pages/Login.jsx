import { useState } from "react";
import { login } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await login(username, password);
            navigate("/");
        } catch (err) {
            alert("Neplatné přihlašovací údaje");
        }
    }

    return (
        <section className="vh-100" style={{ backgroundColor: "#9A616D" }}>
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col col-xl-10">
                        <div className="card" style={{ borderRadius: "1rem" }}>
                            <div className="row g-0">
                                <div className="col-md-6 col-lg-5 d-none d-md-block" style={{ alignContent: "center" }}>
                                    <img
                                        src="login_picture.webp"
                                        alt="login form"
                                        className="img-fluid"
                                        style={{ borderRadius: "1rem 0 0 1rem" }}
                                    />
                                </div>

                                <div className="col-md-6 col-lg-7 d-flex align-items-center">
                                    <div className="card-body p-4 p-lg-5 text-black">
                                        <form onSubmit={handleSubmit}>
                                            <div className="d-flex align-items-center mb-3 pb-1">
                                                <img
                                                    src="/favicon.png"
                                                    height="35"
                                                    alt="logo"
                                                />
                                                <span
                                                    className="h1 fw-bold mb-0"
                                                    style={{ marginLeft: "10px" }}
                                                >
                                                    NCHLS Blansko
                                                </span>
                                            </div>

                                            <h5
                                                className="fw-normal mb-3 pb-3"
                                                style={{ letterSpacing: "1px" }}
                                            >
                                                Přihlaste se
                                            </h5>

                                            <div data-mdb-input-init className="form-outline mb-4">
                                                <input
                                                    id="form2Example17"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="form-control form-control-lg"
                                                />
                                                <label className="form-label" htmlFor="form2Example17">
                                                    Uživatelské jméno
                                                </label>
                                            </div>

                                            <div data-mdb-input-init className="form-outline mb-4">
                                                <input
                                                    id="form2Example27"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="form-control form-control-lg"
                                                />
                                                <label className="form-label" htmlFor="form2Example27">
                                                    Heslo
                                                </label>
                                            </div>

                                            <div className="pt-1 mb-4">
                                                <button
                                                    data-mdb-button-init
                                                    data-mdb-ripple-init
                                                    className="btn btn-dark btn-lg btn-block w-100"
                                                    type="submit"
                                                >
                                                    Přihlásit
                                                </button>
                                            </div>

                                            <a className="small text-muted" href="#!" style={{ textDecoration: "none" }}>
                                                Zapomenuté heslo?
                                            </a>

                                            <p
                                                className="mb-5 pb-lg-2"
                                                style={{ color: "#393f81" }}
                                            >
                                                Nemáte účet?{" "}
                                                <a
                                                    href="#!"
                                                    style={{ color: "#393f81", textDecoration: "none" }}
                                                >
                                                    Zaregistrovat zde
                                                </a>
                                            </p>

                                            <a href="#!" className="small text-muted" style={{ textDecoration: "none" }}>
                                                Podmínky použití.
                                            </a>
                                            <a href="#!" className="small text-muted" style={{ textDecoration: "none", marginLeft: "4px" }}>
                                                Privacy policy
                                            </a>
                                        </form>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
