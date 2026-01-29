import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (confirm('Are you sure you want to log out?')) {
            await supabase.auth.signOut();
            navigate('/');
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' }, // Placeholder path
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside
            className={cn(
                "h-screen sticky top-0 flex flex-col glass border-r border-white/20 transition-all duration-300 z-50",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
                {!collapsed && (
                    <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-white truncate">
                        GreenGlass
                    </span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative",
                            isActive
                                ? "bg-emerald-500/20 text-emerald-100 shadow-md border border-emerald-500/30"
                                : "hover:bg-white/10 text-slate-300 hover:text-white"
                        )}
                    >
                        <item.icon size={22} className="min-w-[22px]" />
                        {!collapsed && <span className="truncate">{item.label}</span>}

                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-3 border-t border-white/10 space-y-2">
                <button
                    onClick={toggleTheme}
                    className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-slate-300 transition-colors",
                        collapsed && "justify-center"
                    )}
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                <button
                    onClick={handleLogout}
                    className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/20 text-red-300 hover:text-red-200 transition-colors",
                        collapsed && "justify-center"
                    )}
                >
                    <LogOut size={20} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
