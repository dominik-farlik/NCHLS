import { useState, useEffect, type ReactNode } from 'react';
import api from '../api/axios';
import { AuthContext } from './useAuth';
import type {UserResponse} from "../schemas/User.ts";

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await api.get('users/me/');
                setUser(response.data);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();

        const handleUnauthorized = () => setUser(null);
        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    const login = (userData: UserResponse) => setUser(userData);

    const logout = async () => {
        try {
            await api.post('auth/logout');
        } catch (error) {
            console.error("Chyba při odhlášení", error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}