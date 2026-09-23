import api from "../api/axios.ts";

export async function openSafetySheet(substance_id) {
    try {
        const response = await api.get(
            `/substances/${substance_id}/sds`,
            { responseType: "blob" }
        );

        const blob = new Blob([response.data], {
            type: response.headers["content-type"] || "application/pdf",
        });

        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");

        setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (err) {
        console.error(err);
        alert("Nemáte oprávnění nebo soubor neexistuje.");
    }
}
