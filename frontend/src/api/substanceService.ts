import api from "./axios.ts";
import type {SubstancePaginationRead} from "../schemas/Substance.ts";


export const substanceService = {
    async getSubstances(offset?: number, order_by?: string, desc?: boolean, department_name?: string, year?: number): Promise<SubstancePaginationRead> {
        const response = await api.get("/substances", {
            params: {
                offset,
                order_by,
                desc,
                department_name,
                year,
            }
        });
        return response.data;
    },
}