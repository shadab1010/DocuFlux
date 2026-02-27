"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import {
    MessageSquare, User, Clock,
    CheckCircle2, Reply, Trash2,
    Mail, Search, Filter, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Ticket {
    id: number;
    user_id: number;
    email: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
}

export default function SupportPortal() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);

    const fetchTickets = () => {
        fetch(`${API_URL}/admin/support`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (!data.error) setTickets(data.tickets);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this ticket?")) return;
        try {
            const res = await fetch(`${API_URL}/admin/support/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setTickets(tickets.filter(t => t.id !== id));
                if (selectedTicket?.id === id) setSelectedTicket(null);
            }
        } catch (e) {
            alert("Failed to delete ticket");
        }
    };

    const handleResolve = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/admin/support`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'resolved' }),
                credentials: 'include'
            });
            if (res.ok) {
                setTickets(tickets.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
                if (selectedTicket?.id === id) setSelectedTicket({ ...selectedTicket, status: 'resolved' });
            }
        } catch (e) {
            alert("Failed to mark resolved");
        }
    };

    const handleReply = async () => {
        if (!selectedTicket || !replyText.trim()) return;
        setSending(true);
        try {
            const res = await fetch(`${API_URL}/admin/support/${selectedTicket.id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: replyText }),
                credentials: 'include'
            });
            if (res.ok) {
                alert("Reply sent successfully and ticket marked resolved.");
                setReplyText("");
                handleResolve(selectedTicket.id);
            }
        } catch (e) {
            alert("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="h-[calc(100vh-160px)] flex gap-6">
            <div className="w-1/3 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 space-y-4">
                    <h1 className="text-xl font-bold text-slate-900">Support Inbox</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Filter messages..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                    {tickets.map(ticket => (
                        <button
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`w-full p-4 text-left hover:bg-slate-50 transition-colors flex flex-col gap-1 ${selectedTicket?.id === ticket.id ? "bg-emerald-50/50 border-r-4 border-emerald-500" : ""
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">#T-{ticket.id}</span>
                                <span className="text-[10px] text-slate-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="font-bold text-slate-800 truncate">{ticket.subject}</p>
                            <p className="text-xs text-slate-500 truncate">{ticket.message}</p>
                            <div className="mt-2 flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'pending' ? "bg-amber-500" : "bg-emerald-500"}`} />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{ticket.status}</span>
                            </div>
                        </button>
                    ))}
                    {!loading && tickets.length === 0 && (
                        <div className="p-8 text-center text-slate-400 italic">No support tickets found</div>
                    )}
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                {selectedTicket ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedTicket.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-1 flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-900">{selectedTicket.email}</h2>
                                        <p className="text-xs text-slate-400">User ID: {selectedTicket.user_id || "Guest"}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleDelete(selectedTicket.id)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={20} />
                                    </button>
                                    {selectedTicket.status !== 'resolved' && (
                                        <button onClick={() => handleResolve(selectedTicket.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-900/10 flex items-center gap-2">
                                            <CheckCircle2 size={16} /> Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</span>
                                    <h3 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h3>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                                    {selectedTicket.message}
                                </div>

                                <div className="pt-8 space-y-4">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                        <Reply size={16} /> Reply to User
                                    </div>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm shadow-inner"
                                        rows={4}
                                        placeholder="Type your response here..."
                                        disabled={selectedTicket.status === 'resolved'}
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleReply}
                                            disabled={sending || !replyText.trim() || selectedTicket.status === 'resolved'}
                                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Mail size={16} /> {sending ? "Sending..." : "Send Email Response"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
                        <div className="p-6 bg-slate-50 rounded-full">
                            <MessageSquare size={48} />
                        </div>
                        <p className="font-medium">Select a ticket from the inbox to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
