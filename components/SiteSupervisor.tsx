import React, { useState } from 'react';
import { MOCK_ANOMALIES, REPAIR_STRATEGIES } from '../constants';
import { generateStrategyJustification } from '../services/geminiService';
import { Wrench, Clock, DollarSign, ShieldAlert, Sparkles, Check } from 'lucide-react';

export const SiteSupervisor: React.FC = () => {
    const activeAnomaly = MOCK_ANOMALIES[0]; // Focus on the critical one
    const [selectedTier, setSelectedTier] = useState<string>('Balanced');
    const [aiReasoning, setAiReasoning] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReasoning = async (tier: string, cost: number, lifeExt: number) => {
        setIsLoading(true);
        setAiReasoning(null);
        
        try {
            // Simulate network delay for effect
            await new Promise(r => setTimeout(r, 800));
            const reasoning = await generateStrategyJustification(tier, cost, lifeExt);
            setAiReasoning(reasoning || "Analysis failed.");
        } catch (error: any) {
            if (error.message === "MISSING_API_KEY") {
                setAiReasoning("⚠️ API Key required. Please configure it in the Configuration tab.");
            } else {
                console.error(error);
                setAiReasoning("Analysis failed.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
            {/* Header Context */}
            <div className="flex justify-between items-start border-b border-primary-dim pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold text-white">Site Supervisor Dashboard</h2>
                        <span className="px-2 py-0.5 bg-alert/20 border border-alert text-alert text-xs font-bold rounded uppercase">
                            Action Required
                        </span>
                    </div>
                    <p className="text-text-muted max-w-2xl">
                        Reviewing strategy for <span className="text-white font-mono">{activeAnomaly.id}</span> on Asset <span className="text-white font-mono">{activeAnomaly.assetId}</span>.
                        Detected <span className="text-alert font-bold">{activeAnomaly.description}</span>
                    </p>
                </div>
                <button className="bg-primary text-background-dark font-bold px-4 py-2 rounded shadow-[0_0_15px_rgba(6,249,249,0.3)] hover:bg-primary-dark transition-colors flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Approve Strategy
                </button>
            </div>

            {/* Strategy Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {REPAIR_STRATEGIES.map((strategy) => {
                    const isSelected = selectedTier === strategy.tier;
                    return (
                        <div 
                            key={strategy.tier}
                            onClick={() => {
                                setSelectedTier(strategy.tier);
                                handleGenerateReasoning(strategy.tier, strategy.cost, strategy.lifeExtension);
                            }}
                            className={`
                                relative rounded-xl border-2 cursor-pointer transition-all duration-300 p-6 flex flex-col h-full
                                ${isSelected 
                                    ? 'border-primary bg-background-panel shadow-[0_0_20px_rgba(6,249,249,0.1)] scale-[1.02]' 
                                    : 'border-primary-dim bg-background-dark opacity-80 hover:opacity-100 hover:border-primary/50'}
                            `}
                        >
                            {strategy.recommended && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-background-dark px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    RECOMMENDED
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`text-xl font-bold ${isSelected ? 'text-primary' : 'text-white'}`}>{strategy.tier}</h3>
                                {isSelected && <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>}
                            </div>

                            <div className="text-3xl font-bold text-white mb-1 font-mono">
                                ${strategy.cost.toLocaleString()}
                            </div>
                            <div className="text-xs text-text-muted mb-6 uppercase tracking-wider">{strategy.name}</div>

                            <div className="space-y-4 mb-6 flex-1">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <Clock className="w-4 h-4" /> Downtime
                                    </div>
                                    <span className="text-white font-mono">{strategy.downtime}h</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <Sparkles className="w-4 h-4" /> Life Ext.
                                    </div>
                                    <span className="text-primary font-bold font-mono">+{strategy.lifeExtension} yrs</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-text-muted">
                                        <ShieldAlert className="w-4 h-4" /> Risk
                                    </div>
                                    <span className={`font-bold ${strategy.riskLevel === 'High' ? 'text-alert' : 'text-success'}`}>
                                        {strategy.riskLevel}
                                    </span>
                                </div>
                            </div>
                            
                            <p className="text-sm text-text-muted leading-relaxed border-t border-primary-dim pt-4">
                                {strategy.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* AI Reasoning Section */}
            <div className="bg-background-panel border border-primary-dim rounded-xl p-4 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Sparkles className="w-24 h-24 md:w-32 md:h-32 text-primary" />
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/30">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Agentic Reasoning Engine</h3>
                    </div>
                </div>

                <div className="bg-background-darker p-4 md:p-6 rounded-lg border border-primary-dim min-h-[100px] flex items-center justify-center relative">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-primary font-mono animate-pulse">ANALYZING TRADE-OFFS...</span>
                        </div>
                    ) : aiReasoning ? (
                        <p className="text-lg text-white font-light italic leading-relaxed text-center">
                            "{aiReasoning}"
                        </p>
                    ) : (
                        <p className="text-text-muted text-sm text-center">
                            Select a strategy tier above to generate autonomous justification.
                        </p>
                    )}
                </div>
                <div className="mt-2 text-center">
                    <span className="text-[10px] text-primary/60 font-mono uppercase">Powered by Gemini 3 Pro Orchestrator</span>
                </div>
            </div>
        </div>
    );
};