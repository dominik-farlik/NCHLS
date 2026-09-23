import type {Property} from "./Property.js";
import type {SubstanceDepartment} from "./SubstanceDepartment.ts";
import type {HazardCategory} from "./HazardCategory.js";

export interface SubstanceRead {
    id: number;
    name: string;
    mixture: boolean;
    physical_form_name?: string;
    unit_name?: string;
    properties?: Property[];
    sds_revision_year?: number;
    note?: string;
    water_toxicity_ec50?: string;
    manufacturer?: string;
    code?: string;
    company_id?: number;
    sds?: string;
    departments: SubstanceDepartment[];
    hazard_category: HazardCategory[];
}

export interface SubstanceCreate {
    name: string;
    mixture: boolean;
    physical_form_name?: string;
    unit_name?: string;
    property_ids?: number[];
    sds_revision_year?: number;
    note?: string;
    water_toxicity_ec50?: string;
    manufacturer?: string;
    code?: string;
    company_id?: number;
    sds?: string;
    hazard_category: HazardCategory[];
}

export interface SubstancePaginationRead {
    items: SubstanceRead[];
    total: number;
    limit: number;
    offset: number;
}