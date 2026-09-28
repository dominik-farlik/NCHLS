import api from "./axios.ts";
import type {SubstanceCreate, SubstancePaginationRead, SubstanceRead} from "../schemas/Substance.ts";


export const substanceService = {
    async getSubstances(offset?: number, order_by?: string, desc?: boolean, department_name?: string, year?: number, search?: string): Promise<SubstancePaginationRead> {
        const response = await api.get("/substances", {
            params: {
                offset,
                order_by,
                desc,
                department_name,
                year,
                search,
            }
        });
        return response.data;
    },

    async getSubstance(substance_id: number): Promise<SubstanceRead> {
        const response = await api.get(`/substances/${substance_id}`);
        return response.data;
    },

    async createSubstance(substanceData: SubstanceCreate): Promise<SubstanceRead> {
        const response = await api.post("/substances", substanceData);
        return response.data;
    },

    async updateSubstance(substanceId: number, substanceData: SubstanceCreate): Promise<SubstanceRead> {
        const response = await api.patch(`/substances/${substanceId}`, substanceData);
        return response.data;
    },
}