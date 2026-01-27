
import React, { useEffect, useState } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { COLORS } from '../constants';
import { scadaService } from '../services/scadaService';
import { TelemetryPoint } from '../types';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background-panel border border-primary-dim p-3 rounded shadow-xl backdrop-blur-md">
                <p className="text-text-muted text-xs font-mono mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-xs font-bold mb-1" style={{ color: entry.color }}>
                        <span>{entry.name}:</span>
                        <span className="text-white">{entry.value.toFixed(2)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export const ScadaAnalytics: React.FC = () => {
    const [history, setHistory] = useState<TelemetryPoint[]>(scadaService.getHistory());

    useEffect(() => {
        const unsubscribe = scadaService.subscribe((_, fullHistory) => {
            setHistory([...fullHistory]); // Create copy to trigger re-render
        });
        return unsubscribe;
    }, []);

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto h-full flex flex-col">
            <div className="flex justify-between items-center flex-shrink-0">
                <h2 className="text-2xl font-bold text-white">SCADA Telemetry Analytics</h2>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded border border-primary/30">1H</button>
                    <button className="px-3 py-1 bg-background-panel text-text-muted text-xs font-bold rounded border border-primary-dim hover:text-white">24H</button>
                    <button className="px-3 py-1 bg-background-panel text-text-muted text-xs font-bold rounded border border-primary-dim hover:text-white">7D</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
                {/* Power Curve Chart */}
                <div className="bg-background-panel border border-primary-dim rounded-xl p-5 flex flex-col">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        Power Output vs Wind Speed
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} opacity={0.2} />
                                <XAxis dataKey="time" stroke={COLORS.grid} tick={{fontSize: 10, fill: '#8ecccc'}} interval={Math.floor(history.length / 5)} />
                                <YAxis stroke={COLORS.grid} tick={{fontSize: 10, fill: '#8ecccc'}} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="power" 
                                    name="Power (kW)" 
                                    stroke={COLORS.primary} 
                                    fillOpacity={1} 
                                    fill="url(#colorPower)" 
                                    strokeWidth={2}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="windSpeed" 
                                    name="Wind (m/s)" 
                                    stroke="#ffffff" 
                                    strokeWidth={1} 
                                    dot={false}
                                    strokeDasharray="4 4" 
                                    opacity={0.5}
                                    yAxisId={0}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vibration Analysis */}
                <div className="bg-background-panel border border-primary-dim rounded-xl p-5 flex flex-col">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-alert rounded-full"></span>
                        Nacelle Vibration (X/Y/Z)
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} opacity={0.2} />
                                <XAxis dataKey="time" stroke={COLORS.grid} tick={{fontSize: 10, fill: '#8ecccc'}} interval={Math.floor(history.length / 5)} />
                                <YAxis stroke={COLORS.grid} tick={{fontSize: 10, fill: '#8ecccc'}} domain={[0, 'auto']} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line 
                                    type="monotone" 
                                    dataKey="vibration" 
                                    name="Vib (mm/s)" 
                                    stroke={COLORS.alert} 
                                    strokeWidth={2} 
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="temperature" 
                                    name="Temp (C)" 
                                    stroke="#fbbf24" 
                                    strokeWidth={1} 
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Raw JSON Stream */}
            <div className="bg-background-darker border border-primary-dim rounded-xl p-4 h-64 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-text-muted font-mono uppercase">Raw Telemetry Stream</h3>
                    <div className="flex gap-2">
                         <span className="text-[10px] bg-background-panel px-2 py-0.5 rounded text-primary border border-primary-dim">JSON</span>
                         <span className="text-[10px] bg-background-panel px-2 py-0.5 rounded text-text-muted border border-primary-dim">WS: CONNECTED</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-xs text-text-muted custom-scrollbar p-2 bg-black/20 rounded">
                    {history.slice().reverse().map((pt, i) => (
                        <div key={i} className="mb-1 hover:bg-white/5 p-1 rounded">
                            <span className="text-primary opacity-60 mr-3">{pt.time}</span>
                            <span className="text-white opacity-80">{`{ "asset": "WTG-04", "pwr": ${pt.power.toFixed(0)}, "vib": ${pt.vibration.toFixed(2)}, "temp": ${pt.temperature.toFixed(1)}, "pitch": ${pt.pitchAngle.toFixed(1)} }`}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
