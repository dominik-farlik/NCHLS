import type {DepartmentRead} from "./Department.js";

export interface SubstanceDepartment {
    department: DepartmentRead;
    year: number;
    amount: number;
}