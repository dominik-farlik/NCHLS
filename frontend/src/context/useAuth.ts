import { createContext, useContext } from 'react';
import type {UserResponse} from "../schemas/User.ts";

export interface AuthContextType {
    user: UserResponse | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: UserResponse) => void;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error("useAuth musí být použit v AuthProvideru");
    return context;
};