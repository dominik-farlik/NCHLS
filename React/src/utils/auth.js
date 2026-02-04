import api from "../api/axios";

function emitAuthChange() {
    window.dispatchEvent(new Event("auth-token-changed"));
}

export function getUsernameFromAccessToken(token) {
    if (!token) return null;
    try {
        const payloadPart = token.split(".")[1];
        const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        const payload = JSON.parse(json);
        return payload?.sub ?? null;
    } catch {
        return null;
    }
}

export function getStoredUsername() {
    return getUsernameFromAccessToken(localStorage.getItem("access_token"));
}

export async function login(username, password) {
    const res = await api.post("/auth/login", { username, password });
    const token = res.data.access_token;
    localStorage.setItem("access_token", token);
    emitAuthChange();
    return token;
}

export async function logout() {
    localStorage.removeItem("access_token");
    emitAuthChange();
    try {
        await api.post("/auth/logout");
    } catch { /* empty */ }
}

