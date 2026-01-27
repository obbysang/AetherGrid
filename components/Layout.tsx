import React from 'react';
import { View } from '../types';
import { 
    LayoutDashboard, 
    Activity, 
    Eye, 
    ClipboardCheck, 
    Wind, 
    Settings,
    Bell,
    Search,
    User,
    Truck,
    Sun
} from 'lucide-react';

interface LayoutProps {
    currentView: View;
    onNavigate: (view: View) => void;
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children }) => {
    
    const navItems = [
        { id: View.MISSION_CONTROL, label: 'Mission Control', icon: LayoutDashboard },
        { id: View.PERCEPTION_LAB, label: 'Perception Lab', icon: Eye },
        { id: View.SCADA_ANALYTICS, label: 'SCADA Analytics', icon: Activity },
        { id: View.SITE_SUPERVISOR, label: 'Site Supervisor', icon: ClipboardCheck },
        { id: View.LOGISTICS, label: 'Logistics & Repair', icon: Truck },
        { id: View.SOLAR_PLANNER, label: 'Solar Planner', icon: Sun },
    ];

    return (
        <div className="flex h-screen w-full bg-background-dark text-text-main font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-background-darker border-r border-primary-dim flex flex-col z-20 flex-shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-primary-dim">
                    <Wind className="text-primary w-6 h-6 mr-3 animate-pulse-slow" />
                    <span className="font-bold text-lg tracking-wider text-white">AETHER<span className="text-primary">GRID</span></span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-widest px-3 mb-2 font-mono">Operations</div>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                                currentView === item.id 
                                ? 'bg-primary-dim text-white border-l-4 border-primary' 
                                : 'text-text-muted hover:bg-background-panel hover:text-white border-l-4 border-transparent'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-primary' : 'text-text-muted group-hover:text-white'}`} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}

                    <div className="text-xs font-bold text-text-muted uppercase tracking-widest px-3 mt-8 mb-2 font-mono">System</div>
                    <button 
                        onClick={() => onNavigate(View.CONFIGURATION)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                            currentView === View.CONFIGURATION
                            ? 'bg-primary-dim text-white border-l-4 border-primary'
                            : 'text-text-muted hover:bg-background-panel hover:text-white border-l-4 border-transparent'
                        }`}
                    >
                        <Settings className={`w-5 h-5 ${currentView === View.CONFIGURATION ? 'text-primary' : 'text-text-muted group-hover:text-white'}`} />
                        <span className="text-sm font-medium">Configuration</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-primary-dim bg-background-panel">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-dim flex items-center justify-center border border-primary">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">Cmdr. J. Vance</span>
                            <span className="text-[10px] text-primary font-mono">ORCHESTRATOR LVL 4</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 border-b border-primary-dim bg-background-dark/80 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                            <span className="text-xs font-mono text-success font-bold tracking-wide">SYSTEM ONLINE</span>
                         </div>
                         <div className="hidden md:flex text-xs text-text-muted font-mono">
                             LATENCY: 12ms | SECTOR: NORTH-07
                         </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-background-panel border border-primary-dim rounded-md px-3 py-1.5 w-64 focus-within:border-primary transition-colors">
                            <Search className="w-4 h-4 text-text-muted mr-2" />
                            <input 
                                type="text" 
                                placeholder="Search asset ID..." 
                                className="bg-transparent border-none outline-none text-sm text-white placeholder-text-muted w-full font-mono"
                            />
                        </div>
                        <button className="relative p-2 text-text-muted hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-alert rounded-full"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 scroll-smooth bg-gradient-to-br from-background-dark to-background-darker">
                    {children}
                </main>
            </div>
        </div>
    );
};