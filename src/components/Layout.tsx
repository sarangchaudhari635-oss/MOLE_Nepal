import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ListPlus,
    Recycle,
    ChevronDown,
    Lightbulb,
    BarChart3,
    Bot,
    FileText,
    LogOut,
    Menu,
    Bell,
    Settings,
    X,
    Clock,
    MessageSquare,
    Orbit,
    TrendingUp,
    CheckCircle2,
    PieChart,
    Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
    getMyNotifications, getUnreadNotificationCount,
    markNotificationsRead, markOneNotificationRead,
    type Notification
} from '../lib/db';

/* ─── Sidebar Item ─── */
const SidebarItem = ({ icon: Icon, label, to, badge }: { icon: any; label: string; to: string; badge?: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-brand-50 text-brand-900 font-semibold border border-brand-100/60'
                : 'text-surface-800/80 hover:bg-surface-50 hover:text-surface-900 font-medium border border-transparent'
            }`
        }
    >
        {({ isActive }) => (
            <>
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-brand-600' : 'text-surface-300 group-hover:text-surface-500'} transition-colors`} />
                <span className="text-[14px] flex-1">{label}</span>
                {badge && (
                    <span className="text-[11px] font-bold bg-brand-500 text-white px-1.5 py-0.5 rounded-md min-w-[20px] text-center leading-none">
                        {badge}
                    </span>
                )}
            </>
        )}
    </NavLink>
);

/* ─── Sidebar Section Label ─── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="px-3.5 text-[11px] font-bold text-surface-400 uppercase tracking-[0.08em] mb-2 mt-6">
        {children}
    </p>
);

/* ─── Notification Type Config ─── */
const notifTypeConfig: Record<string, { color: string; bg: string }> = {
    match_found: { color: 'text-brand-600', bg: 'bg-brand-50' },
    offer_received: { color: 'text-blue-600', bg: 'bg-blue-50' },
    listing_expiring: { color: 'text-amber-600', bg: 'bg-amber-50' },
    impact_milestone: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
    system: { color: 'text-purple-600', bg: 'bg-purple-50' },
    info: { color: 'text-surface-600', bg: 'bg-surface-50' },
};

const relativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};


const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifsLoading, setNotifsLoading] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

    const isProcessingScreen = location.pathname.includes('/processing');
    if (isProcessingScreen) return <Outlet />;

    /* ─── Fetch notifications ─── */
    const loadNotifications = useCallback(async () => {
        setNotifsLoading(true);
        const [notifs, count] = await Promise.all([
            getMyNotifications(20),
            getUnreadNotificationCount(),
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
        setNotifsLoading(false);
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    /* ─── Real-time subscription ─── */
    useEffect(() => {
        const channel = supabase
            .channel('notifications-rt')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
                loadNotifications();
            })
            .subscribe();

        return () => { channel.unsubscribe(); };
    }, [loadNotifications]);

    const handleOpenNotifications = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            loadNotifications();
        }
    };

    const handleMarkAllRead = async () => {
        await markNotificationsRead();
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    const handleMarkOneRead = async (id: string) => {
        await markOneNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    return (
        <div className="min-h-screen bg-[#F5F6F8] flex text-surface-900 font-sans">

            {/* ─── Sidebar ─── */}
            <aside className={`fixed lg:relative z-40 h-screen bg-white w-[252px] flex flex-col transition-transform duration-300 border-r border-surface-200/60 shadow-[2px_0_20px_rgba(0,0,0,0.02)] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                {/* Logo */}
                <div className="h-16 flex items-center px-5 border-b border-surface-100 shrink-0">
                    <NavLink to="/" className="flex items-center gap-2.5 group/logo hover:opacity-80 transition-all">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover/logo:scale-105 transition-transform">
                            <Orbit size={18} className="text-white" />
                        </div>
                        <span className="font-extrabold text-[17px] tracking-tight text-surface-900 group-hover/logo:text-brand-700 transition-colors">MOLE</span>
                    </NavLink>
                </div>

                {/* Nav Items */}
                <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-0.5">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/app" />
                    <SidebarItem icon={ListPlus} label="List Waste" to="/app/list-waste" />
                    <SidebarItem icon={TrendingUp} label="Waste Forecast" to="/app/forecast" />
                    <SidebarItem icon={Recycle} label="Find Materials" to="/app/find" />
                    <SidebarItem icon={MessageSquare} label="Messages" to="/app/messages" />
                    <SidebarItem icon={CheckCircle2} label="My Deals" to="/app/deals" />
                    <SidebarItem icon={Lightbulb} label="Opportunities" to="/app/opportunities" />

                    <SectionLabel>Analytics</SectionLabel>
                    <SidebarItem icon={BarChart3} label="Impact Analytics" to="/app/analytics" />
                    <SidebarItem icon={PieChart} label="Waste Insights" to="/app/insights" />
                    <SidebarItem icon={Bot} label="AI Assistant" to="/app/chat" />
                    <SidebarItem icon={Clock} label="Trade History" to="/app/network" />

                    <SectionLabel>System</SectionLabel>
                    <SidebarItem icon={FileText} label="Reports" to="/app/reports" />
                </div>

            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-surface-900/10 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ─── Main Content ─── */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Header */}
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-surface-200/40 flex items-center justify-between px-6 lg:px-8 z-10 sticky top-0 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="p-2 lg:hidden text-surface-800 hover:bg-surface-100 rounded-lg" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                    <div className="flex items-center gap-2 relative">
                        <NavLink
                            to="/app/settings"
                            className={({ isActive }) => `p-2.5 rounded-xl transition-colors ${isActive ? 'bg-brand-50 text-brand-600' : 'text-surface-500 hover:bg-surface-50'}`}
                        >
                            <Settings size={18} />
                        </NavLink>

                        {/* Notification Bell */}
                        <button
                            onClick={handleOpenNotifications}
                            className="relative p-2.5 text-surface-500 hover:bg-surface-50 rounded-xl transition-colors"
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-white px-1">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* ─── Notification Dropdown ─── */}
                        {showNotifications && (
                            <div className="absolute top-full right-0 mt-3 w-screen max-w-[400px] z-[100] animate-slide-in-top">
                                <div className="absolute -top-1.5 right-4 w-4 h-4 bg-white rotate-45 border-l border-t border-surface-200" />

                                <div className="bg-white border border-surface-200 rounded-[24px] shadow-2xl shadow-black/10 overflow-hidden">
                                    {/* Header */}
                                    <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center shadow-sm">
                                                <Bell size={14} className="text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-[14px] font-bold text-surface-900">Notifications</h4>
                                                <p className="text-[11px] text-surface-400 font-medium">
                                                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllRead}
                                                    className="text-[11px] font-bold text-brand-600 hover:text-brand-700 px-2.5 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setShowNotifications(false)}
                                                className="w-7 h-7 rounded-full hover:bg-surface-100 text-surface-400 hover:text-surface-700 flex items-center justify-center transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Notification List */}
                                    <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                                        {notifsLoading ? (
                                            <div className="flex items-center justify-center py-10">
                                                <Loader size={20} className="text-surface-300 animate-spin" />
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="py-10 text-center">
                                                <Bell size={24} className="text-surface-200 mx-auto mb-2" />
                                                <p className="text-[13px] text-surface-400 font-medium">No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map(notif => {
                                                const cfg = notifTypeConfig[notif.type] || notifTypeConfig.info;
                                                return (
                                                    <div
                                                        key={notif.id}
                                                        onClick={() => {
                                                            if (!notif.is_read) handleMarkOneRead(notif.id);
                                                            if (notif.action_url) {
                                                                setShowNotifications(false);
                                                                window.location.href = notif.action_url;
                                                            }
                                                        }}
                                                        className={`px-5 py-3.5 border-b border-surface-50 cursor-pointer hover:bg-surface-50 transition-colors ${!notif.is_read ? 'bg-brand-50/30' : ''}`}
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                                                <Bell size={14} className={cfg.color} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <h5 className={`text-[13px] font-bold text-surface-900 truncate ${!notif.is_read ? '' : 'opacity-70'}`}>
                                                                        {notif.title}
                                                                    </h5>
                                                                    {!notif.is_read && (
                                                                        <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                                                                    )}
                                                                </div>
                                                                <p className="text-[12px] text-surface-500 font-medium line-clamp-2 leading-relaxed">
                                                                    {notif.body}
                                                                </p>
                                                                <p className="text-[10px] text-surface-400 font-medium mt-1">
                                                                    {relativeTime(notif.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Profile (Top Right) */}
                        <div className="relative border-l border-surface-200/50 pl-2 lg:pl-4 ml-2 max-w-[150px] lg:max-w-[200px]">
                            <button
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                className="flex items-center gap-2 lg:gap-3 hover:bg-surface-50 p-1.5 pr-2 lg:pr-3 rounded-xl transition-colors w-full"
                            >
                                <div className="w-8 h-8 rounded-[10px] bg-[#0FAB76] flex items-center justify-center font-bold text-white text-[14px] shrink-0">
                                    {user?.name?.charAt(0).toLowerCase() || 'a'}
                                </div>
                                <div className="text-left hidden lg:block min-w-0 flex-1">
                                    <p className="text-[13px] font-bold text-surface-900 leading-tight truncate">{user?.name || 'User Profile'}</p>
                                    <p className="text-[11px] font-medium text-surface-400 mt-0.5 truncate">{user?.company || 'Company'}</p>
                                </div>
                                <ChevronDown size={14} className={`hidden lg:block text-surface-300 shrink-0 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {profileMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-[200px] bg-white border border-surface-200 rounded-xl shadow-lg p-1.5 z-[100] animate-fade-in">
                                    <button
                                        onClick={() => { logout(); setProfileMenuOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <LogOut size={14} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>


                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;

