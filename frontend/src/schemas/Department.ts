import type {SubstanceRead} from "./Substance.ts";

export interface DepartmentRead {
    id: number;
    name: string;
    company_id: number;
    manager?: string;
    code?: number;
}

export interface DepartmentSubstanceRead {
    department: DepartmentRead;
    substance: SubstanceRead;
    year: number;
    amount: number;
}

export interface DepartmentSubstanceCreate {
    department_id: number;
    substance_id: number;
    year: number;
    amount: number;
}