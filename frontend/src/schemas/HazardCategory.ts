export interface HazardCategory {
    name: string;
    section?: string;
    max_amount_a?: number;
    code?: string
    max_amount_b?: number;
    protocol_table_name?: string;
    note?: string;
}