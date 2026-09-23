import type {HStatement} from "./HStatement.js";
import type {HazardCategory} from "./HazardCategory.js";

export interface Property {
    id: number;
    name: string;
    category_name?: string;
    exposure_route_name?: string;
    h_statements?: HStatement[];
    hazard_category?: HazardCategory[];
}