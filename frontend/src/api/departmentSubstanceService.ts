import type {SubstanceRead} from "../schemas/Substance.ts";
import api from "./axios.ts";
import type {DepartmentSubstanceCreate, DepartmentSubstanceRead} from "../schemas/Department.ts";

export const departmentSubstanceService = {
    async getDepartmentSubstances(departmentId: number, year: number): Promise<DepartmentSubstanceRead[]> {
        const response = await api.get("/records", {
            params: {
                department_id: Number(departmentId),
                year: year,
            }
        });
        return response.data;
    },

    async createDepartmentSubstance(createData: DepartmentSubstanceCreate): Promise<SubstanceRead> {
        const response = await api.post("/records", createData);
        return response.data;
    },

    async updateDepartmentSubstance(updateData: DepartmentSubstanceCreate): Promise<SubstanceRead> {
        const response = await api.patch("/records", updateData);
        return response.data;
    },

    async deleteDepartmentSubstance(substanceId: number, departmentId: number, year: number): Promise<void> {
        const payload = { substance_id: substanceId, department_id: departmentId, year: year };
        await api.delete("/records", {data: payload})
    }
}