"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "@/lib/config";

interface User {
    id: number;
    name: string;
    email: string;
    role: "super_admin" | "admin" | "support" | "user";
    status: "active" | "banned";
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (userData: User) => void;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    hasSeenModal: boolean;
    markModalSeen: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    const [hasSeenModal, setHasSeenModal] = useState(false);

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/me`, {
                credentials: "include",
            });
            const data = await res.json();
            if (data.authenticated) {
                setUser(data.user);
                setIsLoggedIn(true);
            } else {
                setUser(null);
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            setUser(null);
            setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setUser(null);
            setIsLoggedIn(false);
        }
    };

    const markModalSeen = () => {
        setHasSeenModal(true);
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, checkAuth, hasSeenModal, markModalSeen }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
