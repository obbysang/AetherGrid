
import React, { useEffect, useState } from 'react';
import { Zap, Activity, AlertTriangle, Wind, BrainCircuit, Terminal } from 'lucide-react';
import { scadaService } from '../services/scadaService';
import { runMissionControlAgent } from '../services/geminiService';
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
            <span>{trend > 0 ? '+' : ''}{Math.abs(trend).toFixed(1)}%</span>
            <span className="text-text-muted font-normal">vs last hr</span>
        </div>
    </div>
);

export const MissionControl: React.FC = () => {
    const [telemetry, setTelemetry] = useState(scadaService.getLatest());
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [agentState, setAgentState] = useState<{
        status: 'IDLE' | 'THINKING' | 'EXECUTING' | 'COMPLETED';
        steps: any[];
    }>({ status: 'IDLE', steps: [] });

    useEffect(() => {
        // Subscribe to real-time SCADA updates
        const unsubscribe = scadaService.subscribe((point) => {
            setTelemetry(point);
            
            // Periodically check for anomalies (simulated AI trigger)
            scadaService.analyzeTelemetry(60).then(result => {
                if (result.anomalyDetected) {
                    const newAnomalies = result.anomalies.filter(a => !anomalies.find(p => p.id === a.id));
                    
                    if (newAnomalies.length > 0) {
                        setAnomalies(prev => [...newAnomalies, ...prev].slice(0, 10));
                        
                        // TRIGGER AGENT AUTOMATICALLY
                        if (agentState.status === 'IDLE') {
                            triggerAgent(newAnomalies[0]);
                        }
                    }
                }
            });
        });
        return unsubscribe;
    }, [anomalies, agentState.status]);

    const triggerAgent = async (anomaly: Anomaly) => {
        setAgentState({ status: 'THINKING', steps: [] });
        
        try {
            const result = await runMissionControlAgent(
                `Anomaly Detected: ${anomaly.type} on ${anomaly.assetId}`, 
                { anomaly, telemetry: scadaService.getLatest() }
            );
            
            setAgentState({
                status: 'COMPLETED',
                steps: result.steps
            });
        } catch (e) {
            console.error("Agent Failed", e);
            setAgentState(prev => ({ ...prev, status: 'IDLE' }));
        }
    };

    if (!telemetry) return <div className="p-10 text-white">Initializing SCADA Uplink...</div>;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Mission Control</h1>
                    <p className="text-text-muted text-sm">Real-time infrastructure monitoring • Grid Sector 7</p>
                </div>
                <div className="text-left md:text-right">
                    <p className="text-xs text-text-muted font-mono uppercase">Last Sync</p>
                    <p className="text-primary font-bold font-mono">LIVE: {telemetry.time}</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Energy Output" 
                    value={(telemetry.power / 1000).toFixed(2)} 
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
                    value={anomalies.length} 
                    unit="CRIT" 
                    trend={10} 
                    trendUp={false} 
                    icon={AlertTriangle} 
                    color="#fa5c38" 
                />
                <StatCard 
                    title="Avg Wind Speed" 
                    value={telemetry.windSpeed.toFixed(1)} 
                    unit="m/s" 
                    trend={1.2} 
                    trendUp={true} 
                    icon={Wind} 
                    color="#ffffff" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[600px] h-auto">
                {/* Map Placeholder */}
                <div className="lg:col-span-2 bg-background-panel border border-primary-dim rounded-xl overflow-hidden relative group min-h-[400px] lg:min-h-0">
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
                     {telemetry.vibration > 4 && (
                         <div className="absolute top-[30%] left-[45%]">
                            <div className="relative group/marker cursor-pointer">
                                <div className="w-4 h-4 bg-alert rounded-full border-2 border-white shadow-[0_0_15px_#fa5c38] animate-pulse"></div>
                                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background-dark border border-alert text-white text-xs p-2 rounded whitespace-nowrap hidden group-hover/marker:block z-20">
                                    WTG-04: Critical Vibration ({(telemetry.vibration).toFixed(1)}mm/s)
                                 </div>
                            </div>
                         </div>
                     )}
                     
                     <div className="absolute top-[50%] left-[60%]">
                        <div className="relative group/marker cursor-pointer">
                            <div className="w-3 h-3 bg-primary rounded-full border border-white shadow-[0_0_10px_#06f9f9]"></div>
                        </div>
                     </div>

                     {/* Agent "Thought Bubble" Overlay */}
                     {agentState.status !== 'IDLE' && (
                        <div className="absolute bottom-4 right-4 max-w-md w-full bg-black/80 backdrop-blur-md border border-primary rounded-lg p-4 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500">
                            <div className="flex items-center gap-2 mb-3 border-b border-primary/30 pb-2">
                                <BrainCircuit className={`w-5 h-5 text-primary ${agentState.status === 'THINKING' ? 'animate-pulse' : ''}`} />
                                <span className="font-bold text-sm text-white">
                                    {agentState.status === 'THINKING' ? 'ORCHESTRATOR ACTIVE...' : 'MISSION COMPLETE'}
                                </span>
                            </div>
                            <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar font-mono text-xs">
                                {agentState.steps.map((step, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="text-primary/80 font-bold">Step {step.step}: {step.action === 'Final Answer' ? 'Conclusion' : step.action}</div>
                                        <div className="text-white/70 pl-2 border-l-2 border-primary/20 italic">"{step.thought.substring(0, 100)}..."</div>
                                        {step.result && (
                                            <div className="text-success/80 pl-2">
                                                <Terminal className="w-3 h-3 inline mr-1" />
                                                Result: {JSON.stringify(step.result).substring(0, 50)}...
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {agentState.status === 'THINKING' && (
                                    <div className="flex items-center gap-2 text-text-muted italic">
                                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                                        Reasoning...
                                    </div>
                                )}
                            </div>
                        </div>
                     )}
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
                        {anomalies.map((anomaly, idx) => (
                            <div key={idx} className={`p-3 border-b border-primary-dim/30 hover:bg-white/5 transition-colors border-l-2 ${anomaly.severity === 'CRITICAL' ? 'border-l-alert bg-alert/5' : 'border-l-primary/50'}`}>
                                <div className="flex justify-between mb-1 opacity-70">
                                    <span>{new Date(anomaly.timestamp).toLocaleTimeString()}</span>
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
                        {anomalies.length === 0 && (
                             <div className="p-3 text-text-muted opacity-50 italic">
                                 No active anomalies detected in current window.
                             </div>
                        )}
                        {/* System Heartbeat Log */}
                        <div className="p-3 border-b border-primary-dim/30 hover:bg-white/5 transition-colors border-l-2 border-l-transparent opacity-50">
                            <div className="flex justify-between mb-1">
                                <span>{telemetry.time}</span>
                                <span>SYS-LOG</span>
                            </div>
                            <div className="text-text-muted">
                                SCADA Telemetry Stream Active. 
                                Vib: {telemetry.vibration.toFixed(2)} | 
                                Temp: {telemetry.temperature.toFixed(1)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
