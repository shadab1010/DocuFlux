"use client";

import { useAuth } from "../context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard, Users, FileText, Settings, BarChart3,
    ShieldAlert, MessageSquare, LogOut, Menu, X, Globe,
    Activity, Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoggedIn, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mounted, setMounted] = useState(false);

    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isLoading && !isLoginPage) {
            if (!isLoggedIn) {
                router.push("/");
            } else if (user?.role !== "admin" && user?.role !== "super_admin") {
                router.push("/");
            }
        }
    }, [isLoading, isLoggedIn, user, router, isLoginPage]);

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
        { name: "Users", icon: Users, href: "/admin/users" },
        { name: "Files", icon: FileText, href: "/admin/files" },
        { name: "Analytics", icon: BarChart3, href: "/admin/analytics" },
        { name: "Support", icon: MessageSquare, href: "/admin/support" },
        { name: "Security", icon: ShieldAlert, href: "/admin/security" },
        { name: "Settings", icon: Settings, href: "/admin/settings" },
    ];

    if (user?.role === "super_admin") {
        menuItems.splice(1, 0, { name: "Manage Admins", icon: ShieldAlert, href: "/admin/admins" });
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? "w-64" : "w-20"} bg-[#022c22] text-white transition-all duration-300 flex flex-col fixed h-full z-50`}
            >
                <div className="p-6 flex items-center justify-between border-b border-white/10 h-20">
                    <AnimatePresence mode="wait">
                        {isSidebarOpen ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white">D</div>
                                <span className="font-bold text-xl tracking-tight">DocuFlux</span>
                            </motion.div>
                        ) : (
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white mx-auto">D</div>
                        )}
                    </AnimatePresence>
                </div>

                <nav className="flex-1 py-6">
                    <ul className="space-y-2 px-3">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-emerald-100/70 hover:text-white"
                                >
                                    <item.icon size={20} />
                                    {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Link href="/" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-emerald-800 transition-colors text-emerald-200">
                        <Globe size={20} />
                        {isSidebarOpen && <span className="font-medium text-sm">Main Site</span>}
                    </Link>
                    <button
                        onClick={async () => {
                            await logout();
                            router.push("/");
                        }}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/20 transition-colors text-red-400 mt-2"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="font-medium text-sm">Logout Admin</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
                {/* Topbar */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full text-emerald-700 text-sm font-medium">
                            <Activity size={16} />
                            <span>System Operational</span>
                        </div>

                        <button className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 mt-1">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-white shadow-sm">
                                {user?.name?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
