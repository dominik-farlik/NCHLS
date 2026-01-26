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
        <form onSubmit={handleSubmit}>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Přihlásit</button>
        </form>
    );
}
