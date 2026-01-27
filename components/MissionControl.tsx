import React from 'react';
import { Zap, Activity, AlertTriangle, Wind } from 'lucide-react';
import { MOCK_ANOMALIES } from '../constants';
import { Anomaly } from '../types';

const StatCard = ({ title, value, unit, trend, trendUp, icon: Icon, color }: any) => (
    <div className="bg-background-panel border border-primary-dim p-4 rounded-xl relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon className="w-16 h-16" style={{ color }} />
        </div>
        <div className="flex justify-between items-start mb-2">
            <span className="text-text-muted text-xs font-bold uppercase tracking-wider">{title}</span>
            <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex items-end gap-2">
            <span className="text-3xl font-bold font-sans tracking-tight text-white">{value}</span>
            <span className="text-sm text-text-muted mb-1 font-mono">{unit}</span>
        </div>
        <div className={`text-xs font-bold mt-2 flex items-center gap-1 ${trendUp ? 'text-success' : 'text-alert'}`}>
            <span>{trend > 0 ? '+' : ''}{trend}%</span>
            <span className="text-text-muted font-normal">vs last hr</span>
        </div>
    </div>
);

export const MissionControl: React.FC = () => {
    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Mission Control</h1>
                    <p className="text-text-muted text-sm">Real-time infrastructure monitoring • Grid Sector 7</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-text-muted font-mono uppercase">Last Sync</p>
                    <p className="text-primary font-bold font-mono">T-MINUS 00:03s</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Energy Output" 
                    value="452.8" 
                    unit="MW" 
                    trend={2.4} 
                    trendUp={true} 
                    icon={Zap} 
                    color="#06f9f9" 
                />
                <StatCard 
                    title="Fleet Availability" 
                    value="98.2" 
                    unit="%" 
                    trend={-0.4} 
                    trendUp={false} 
                    icon={Activity} 
                    color="#0bda50" 
                />
                <StatCard 
                    title="Active Alerts" 
                    value="3" 
                    unit="CRIT" 
                    trend={10} 
                    trendUp={false} 
                    icon={AlertTriangle} 
                    color="#fa5c38" 
                />
                <StatCard 
                    title="Avg Wind Speed" 
                    value="12.4" 
                    unit="m/s" 
                    trend={1.2} 
                    trendUp={true} 
                    icon={Wind} 
                    color="#ffffff" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Map Placeholder */}
                <div className="lg:col-span-2 bg-background-panel border border-primary-dim rounded-xl overflow-hidden relative group">
                     <div className="absolute inset-0 bg-[url('https://picsum.photos/1200/800?grayscale&blur=2')] bg-cover opacity-20 mix-blend-overlay"></div>
                     <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                     
                     {/* Overlay Grid */}
                     <div className="absolute inset-0 bg-[linear-gradient(rgba(6,249,249,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,249,249,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                     
                     <div className="absolute top-4 left-4 z-10 bg-background-dark/90 border border-primary-dim p-3 rounded backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                             <span className="text-xs font-bold text-white uppercase">Geospatial Command</span>
                        </div>
                        <div className="font-mono text-[10px] text-text-muted space-y-1">
                            <div>LAT: 54.321 N</div>
                            <div>LNG: 02.145 W</div>
                            <div>ZOOM: 12x</div>
                        </div>
                     </div>

                     {/* Interactive Dots (Simulated) */}
                     <div className="absolute top-[30%] left-[45%]">
                        <div className="relative group/marker cursor-pointer">
                            <div className="w-4 h-4 bg-alert rounded-full border-2 border-white shadow-[0_0_15px_#fa5c38] animate-pulse"></div>
                             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background-dark border border-alert text-white text-xs p-2 rounded whitespace-nowrap hidden group-hover/marker:block z-20">
                                WTG-04: Critical Vibration
                             </div>
                        </div>
                     </div>
                     
                     <div className="absolute top-[50%] left-[60%]">
                        <div className="relative group/marker cursor-pointer">
                            <div className="w-3 h-3 bg-primary rounded-full border border-white shadow-[0_0_10px_#06f9f9]"></div>
                        </div>
                     </div>
                </div>

                {/* Live Logs */}
                <div className="bg-background-panel border border-primary-dim rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-primary-dim bg-background-dark/50 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" />
                            Intelligence Stream
                        </h3>
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#06f9f9]"></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-0 font-mono text-xs">
                        {MOCK_ANOMALIES.map((anomaly, idx) => (
                            <div key={idx} className={`p-3 border-b border-primary-dim/30 hover:bg-white/5 transition-colors border-l-2 ${anomaly.severity === 'CRITICAL' ? 'border-l-alert bg-alert/5' : 'border-l-primary/50'}`}>
                                <div className="flex justify-between mb-1 opacity-70">
                                    <span>{anomaly.timestamp}</span>
                                    <span>{anomaly.id}</span>
                                </div>
                                <div className={`font-bold mb-1 ${anomaly.severity === 'CRITICAL' ? 'text-alert' : 'text-white'}`}>
                                    {anomaly.type} DETECTED
                                </div>
                                <div className="text-text-muted leading-tight">
                                    {anomaly.description}
                                </div>
                            </div>
                        ))}
                        {/* Filler logs */}
                        {[1, 2, 3, 4].map((i) => (
                             <div key={`log-${i}`} className="p-3 border-b border-primary-dim/30 hover:bg-white/5 transition-colors border-l-2 border-l-transparent opacity-50">
                                <div className="flex justify-between mb-1">
                                    <span>10:{40-i}:12</span>
                                    <span>SYS-LOG</span>
                                </div>
                                <div className="text-text-muted">Routine diagnostic scan completed. Asset WTG-{10+i} nominal.</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};