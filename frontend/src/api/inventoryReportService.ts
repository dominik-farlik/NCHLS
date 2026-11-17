import api from "./axios.ts";

export type InventoryReportFormat = "pdf" | "docx";

export interface InventoryReportDefaults {
    responsible_employee: string;
    contact: string;
}

export interface InventoryReportRequest {
    year: number;
    format: InventoryReportFormat;
    date: string;
    responsible_employee: string;
    performed_by: string;
    contact: string;
}

function filenameFromHeader(header: string | undefined, fallback: string): string {
    const match = header?.match(/filename\*=UTF-8''([^;]+)/i);
    return match ? decodeURIComponent(match[1]) : fallback;
}

export const inventoryReportService = {
    async getDefaults(departmentId: number): Promise<InventoryReportDefaults> {
        const response = await api.get(`/departments/${departmentId}/inventory-report/defaults`);
        return response.data;
    },

    async download(departmentId: number, payload: InventoryReportRequest): Promise<void> {
        const response = await api.post(`/departments/${departmentId}/inventory-report`, payload, {
            responseType: "blob",
        });
        const filename = filenameFromHeader(
            response.headers["content-disposition"],
            `Inventarizace ${payload.year}.${payload.format}`,
        );
        const url = URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    },
};
