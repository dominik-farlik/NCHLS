import api from "../api/axios";

export async function login(username, password) {
    const res = await api.post("/auth/login", {
        username,
        password,
    });

    const token = res.data.access_token;
    localStorage.setItem("access_token", token);
    return token;
}

export function logout() {
    localStorage.removeItem("access_token");
}
