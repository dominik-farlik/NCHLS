import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = api
            .post("/auth/refresh")
            .then((res) => {
                const token = res.data.access_token;
                localStorage.setItem("access_token", token);
                window.dispatchEvent(new Event("auth-token-changed"));
                return token;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
}

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;

        const url = original?.url || "";
        const isAuthCall = url.includes("/auth/login") || url.includes("/auth/refresh") || url.includes("/auth/logout");

        if (err.response?.status === 401 && !original?._retry && !isAuthCall) {
            original._retry = true;
            try {
                const newToken = await refreshAccessToken();
                original.headers = original.headers || {};
                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            } catch (e) {
                localStorage.removeItem("access_token");
                window.location.replace("/login");
                return Promise.reject(e);
            }
        }

        return Promise.reject(err);
    }
);


export default api;
