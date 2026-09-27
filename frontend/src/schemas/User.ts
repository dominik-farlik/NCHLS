import {Role} from "./Role.ts";

export interface RoleResponse {
    name: Role;
}

export interface UserResponse {
    id: number;
    username?: string;
    email: string;
    first_name: string;
    last_name: string;
    role: RoleResponse;
    public_last_name: boolean;
}

export interface UserCreate {
    email: string;
    first_name: string;
    last_name: string;
    username?: string | null;
    password: string;
}

export interface UserLogin {
    username: string;
    password: string;
}