import React, { useState } from 'react';
import { Sun, Map, DollarSign, BatteryCharging, ArrowRight, Layers } from 'lucide-react';
import { optimizeSolarLayout } from '../services/geminiService';
import { SolarPotential } from '../types';

export const SolarPlanner: React.FC = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<SolarPotential | null>(null);

    const handleAnalysis = async () => {
        setAnalyzing(true);
        // Simulate API call to Gemini + Google Maps Solar API
        setTimeout(async () => {
            const data = await optimizeSolarLayout(51.5074, -0.1278);
            setResult(data);
            setAnalyzing(false);
        }, 2000);
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-end flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Solar Resource Planner</h1>
                    <p className="text-text-muted text-sm">Rooftop Optimization • Google Maps Solar API Integration</p>
                </div>
                <div className="flex gap-3">
                     <div className="px-3 py-1 bg-primary/10 border border-primary text-primary rounded text-xs font-mono font-bold flex items-center">
                        API STATUS: CONNECTED
                     </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {/* Map Interface */}
                <div className="lg:col-span-2 bg-black rounded-xl border border-primary-dim relative overflow-hidden group">
                     {/* Placeholder for Google Maps Solar API Visual */}
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1624397640148-949b1732bb0a?q=80&w=2600&auto=format&fit=crop')] bg-cover opacity-60"></div>
                     <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                     
                     {/* Map Overlay UI */}
                     <div className="absolute top-4 left-4 bg-background-dark/90 border border-primary-dim p-4 rounded-lg backdrop-blur-md w-80">
                         <div className="flex items-center gap-2 mb-4">
                             <Map className="w-4 h-4 text-primary" />
                             <span className="text-sm font-bold text-white">Target Building</span>
                         </div>
                         <div className="space-y-3">
                             <div>
                                 <label className="text-xs text-text-muted block mb-1">Address / Coordinates</label>
                                 <input type="text" value="Building A42, Sector 7" className="w-full bg-background-panel border border-primary-dim rounded p-2 text-xs text-white" readOnly />
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                <div>
                                     <label className="text-xs text-text-muted block mb-1">Panel Type</label>
                                     <select className="w-full bg-background-panel border border-primary-dim rounded p-2 text-xs text-white outline-none">
                                         <option>Monocrystalline</option>
                                         <option>Polycrystalline</option>
                                     </select>
                                </div>
                                <div>
                                     <label className="text-xs text-text-muted block mb-1">Analysis Period</label>
                                     <select className="w-full bg-background-panel border border-primary-dim rounded p-2 text-xs text-white outline-none">
                                         <option>Annual</option>
                                         <option>Quarterly</option>
                                     </select>
                                </div>
                             </div>
                             <button 
                                onClick={handleAnalysis}
                                disabled={analyzing}
                                className="w-full bg-primary text-background-dark font-bold py-2 rounded text-sm hover:bg-primary-dark transition-colors flex justify-center items-center gap-2"
                            >
                                {analyzing ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></div>
                                        CALCULATING FLUX...
                                    </>
                                ) : (
                                    <>
                                        <Sun className="w-4 h-4" />
                                        RUN ANALYSIS
                                    </>
                                )}
                             </button>
                         </div>
                     </div>

                     {result && (
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             {/* Simulated Heatmap Overlay */}
                             <div className="w-[400px] h-[300px] bg-gradient-to-br from-yellow-500/30 to-red-500/30 blur-2xl rounded-full mix-blend-overlay"></div>
                         </div>
                     )}
                </div>

                {/* Results Panel */}
                <div className="space-y-4 flex flex-col">
                    <div className="bg-background-panel border border-primary-dim rounded-xl p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                        {!result ? (
                             <div className="text-center text-text-muted opacity-50">
                                 <Sun className="w-16 h-16 mx-auto mb-4" />
                                 <p className="text-sm">Initiate analysis to generate solar flux model.</p>
                             </div>
                        ) : (
                            <div className="space-y-6 relative z-10 animate-fade-in">
                                <h3 className="text-lg font-bold text-white border-b border-primary-dim pb-2">Solar Potential Report</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-background-dark rounded border border-primary-dim">
                                        <div className="text-xs text-text-muted mb-1">Total Flux</div>
                                        <div className="text-xl font-bold text-primary font-mono">{result.fluxKwh.toLocaleString()} <span className="text-xs">kWh/yr</span></div>
                                    </div>
                                    <div className="p-3 bg-background-dark rounded border border-primary-dim">
                                        <div className="text-xs text-text-muted mb-1">Usable Area</div>
                                        <div className="text-xl font-bold text-white font-mono">{result.areaSqM} <span className="text-xs">m²</span></div>
                                    </div>
                                    <div className="p-3 bg-background-dark rounded border border-primary-dim">
                                        <div className="text-xs text-text-muted mb-1">Panel Count</div>
                                        <div className="text-xl font-bold text-white font-mono">{result.panelCount} <span className="text-xs">units</span></div>
                                    </div>
                                    <div className="p-3 bg-background-dark rounded border border-primary-dim">
                                        <div className="text-xs text-text-muted mb-1">Shade Loss</div>
                                        <div className="text-xl font-bold text-alert font-mono">{result.shadeLoss}%</div>
                                    </div>
                                </div>

                                <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-5 h-5 text-success" />
                                        <span className="font-bold text-success">Financial Projection</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-xs text-success/80">Annual Savings</div>
                                            <div className="text-2xl font-bold text-white">${result.annualSavings.toLocaleString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-success/80">Payback Period</div>
                                            <div className="text-2xl font-bold text-white">{result.paybackPeriod} <span className="text-sm font-normal">yrs</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-background-panel border border-primary-dim rounded-xl p-6 h-1/3">
                        <div className="flex items-center gap-3 mb-4">
                             <BatteryCharging className="w-5 h-5 text-primary" />
                             <h3 className="font-bold text-white text-sm uppercase">Storage Integration</h3>
                        </div>
                        <p className="text-xs text-text-muted mb-4 leading-relaxed">
                            Based on the flux profile, adding a <strong>50kWh BESS</strong> would capture <strong>12%</strong> more energy during peak hours.
                        </p>
                        <button className="w-full py-2 border border-primary text-primary rounded text-xs font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2">
                            VIEW STORAGE OPTIONS <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};