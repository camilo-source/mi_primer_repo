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
        if (confirm('¿Estás seguro que querés cerrar sesión?')) {
            await supabase.auth.signOut();
            navigate('/');
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Calendar, label: 'Calendario', path: '/calendar' },
        { icon: Settings, label: 'Ajustes', path: '/settings' },
    ];

    return (
        <aside
            className={cn(
                "h-screen sticky top-0 flex flex-col transition-all duration-300 z-50",
                "bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]",
                "shadow-[var(--shadow-md)]",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="p-4 flex items-center justify-between border-b border-[var(--sidebar-border)]">
                {!collapsed && (
                    <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand-primary)] to-emerald-700 dark:to-emerald-200 truncate">
                        VIBE CODE
                    </span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                {navItems.map((item, index) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ease-apple group relative apple-hover",
                            "animate-apple-slide-right",
                            isActive
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-100 shadow-md border border-emerald-500/30 glow-border-static"
                                : "hover:bg-emerald-500/10 text-[var(--sidebar-text)] hover:text-emerald-600 dark:hover:text-emerald-300"
                        )}
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <item.icon size={22} className="min-w-[22px] transition-transform duration-300 ease-apple group-hover:scale-110" />
                        {!collapsed && <span className="truncate">{item.label}</span>}

                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 ease-apple whitespace-nowrap pointer-events-none z-50 apple-scale-in">
                                {item.label}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer actions */}
            <div className="p-3 border-t border-[var(--card-border)] space-y-2">
                <button
                    onClick={toggleTheme}
                    className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                        "hover:bg-emerald-500/10 text-[var(--sidebar-text)] hover:text-emerald-600 dark:hover:text-emerald-300",
                        collapsed && "justify-center"
                    )}
                    title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    {!collapsed && <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>}
                </button>

                <button
                    onClick={handleLogout}
                    className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                        "hover:bg-red-500/10 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300",
                        collapsed && "justify-center"
                    )}
                >
                    <LogOut size={20} />
                    {!collapsed && <span>Cerrar Sesión</span>}
                </button>
            </div>
        </aside>
    );
}
