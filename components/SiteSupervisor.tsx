import React, { useState, useEffect } from 'react';
import { MOCK_ANOMALIES, REPAIR_STRATEGIES } from '../constants';
import { generateStrategyJustification } from '../services/geminiService';
import { Wrench, Clock, DollarSign, ShieldAlert, Sparkles, Check, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Anomaly } from '../types';

export const SiteSupervisor: React.FC = () => {
    const [activeAnomaly, setActiveAnomaly] = useState<Anomaly | null>(null);
    const [selectedTier, setSelectedTier] = useState<string>('Balanced');
    const [aiReasoning, setAiReasoning] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [approvalSuccess, setApprovalSuccess] = useState(false);

    useEffect(() => {
        const fetchAnomaly = async () => {
            try {
                // Try to fetch an open anomaly
                const { data, error } = await supabase
                    .from('anomalies')
                    .select('*')
                    .eq('status', 'OPEN')
                    .limit(1)
                    .maybeSingle();

                if (data) {
                    setActiveAnomaly({
                        ...data,
                        assetId: data.asset_id,
                        recommendedAction: data.recommended_action
                    } as unknown as Anomaly);
                } else {
                    // If no open anomaly in DB, check if we need to seed
                    const { count } = await supabase.from('anomalies').select('*', { count: 'exact', head: true });
                    
                    if (count === 0) {
                         // Seed DB with MOCK_ANOMALIES
                         console.log("Seeding anomalies...");
                         // Map camelCase to snake_case for DB
                         const dbAnomalies = MOCK_ANOMALIES.map(a => ({
                             id: a.id,
                             timestamp: a.timestamp,
                             type: a.type,
                             severity: a.severity,
                             confidence: a.confidence,
                             description: a.description,
                             asset_id: a.assetId,
                             status: a.status,
                             recommended_action: a.recommendedAction
                         }));

                         const { data: insertedData, error: insertError } = await supabase
                            .from('anomalies')
                            .insert(dbAnomalies)
                            .select();
                         
                         if (insertError) {
                             console.error("Error seeding data:", insertError);
                             setActiveAnomaly(MOCK_ANOMALIES[0]); // Fallback
                         } else if (insertedData && insertedData.length > 0) {
                             const firstAnomaly = insertedData[0];
                             setActiveAnomaly({
                                 ...firstAnomaly,
                                 assetId: firstAnomaly.asset_id,
                                 recommendedAction: firstAnomaly.recommended_action
                             } as unknown as Anomaly);
                         }
                    } else {
                         // DB has data but no OPEN anomaly.
                         // For demo purposes, let's fetch ANY anomaly or fallback to mock
                         const { data: anyData } = await supabase
                            .from('anomalies')
                            .select('*')
                            .limit(1)
                            .maybeSingle();
                        
                        if (anyData) {
                            setActiveAnomaly({
                                ...anyData,
                                assetId: anyData.asset_id,
                                recommendedAction: anyData.recommended_action
                            } as unknown as Anomaly);
                        } else {
                            setActiveAnomaly(MOCK_ANOMALIES[0]);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching anomaly:", err);
                setActiveAnomaly(MOCK_ANOMALIES[0]); // Fallback
            }
        };

        fetchAnomaly();
    }, []);

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

    const handleApproveStrategy = async () => {
        if (!activeAnomaly) return;
        setIsApproving(true);

        const strategy = REPAIR_STRATEGIES.find(s => s.tier === selectedTier);
        if (!strategy) return;

        try {
            // 1. Create Work Order
            const { error: woError } = await supabase
                .from('work_orders')
                .insert({
                    anomaly_id: activeAnomaly.id,
                    asset_id: activeAnomaly.assetId,
                    strategy_tier: strategy.tier,
                    cost: strategy.cost,
                    downtime_hours: strategy.downtime,
                    life_extension_years: strategy.lifeExtension,
                    status: 'PENDING',
                    justification: aiReasoning || "Approved by Site Supervisor"
                });

            if (woError) throw woError;

            // 2. Update Anomaly Status
            const { error: anomalyError } = await supabase
                .from('anomalies')
                .update({ status: 'RESOLVED' })
                .eq('id', activeAnomaly.id);

            if (anomalyError) throw anomalyError;

            setApprovalSuccess(true);
            
            // 3. Update local state to reflect change
            setActiveAnomaly(prev => prev ? { ...prev, status: 'RESOLVED' } : null);

        } catch (error) {
            console.error("Error approving strategy:", error);
            alert("Failed to approve strategy. Please check console.");
        } finally {
            setIsApproving(false);
        }
    };

    if (!activeAnomaly) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-text-muted">Loading anomaly data from Supabase...</p>
                </div>
            </div>
        );
    }

    if (approvalSuccess || activeAnomaly.status === 'RESOLVED') {
         return (
            <div className="max-w-[1200px] mx-auto py-24 text-center space-y-6 animate-in fade-in duration-700">
                <div className="inline-flex p-6 rounded-full bg-success/10 text-success border border-success/30 shadow-[0_0_30px_rgba(11,218,80,0.2)]">
                    <Check className="w-16 h-16" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold text-white">Strategy Approved</h2>
                    <p className="text-xl text-text-muted max-w-lg mx-auto">
                        Work order generated for <span className="text-white font-mono">{activeAnomaly.assetId}</span>. 
                        Crew dispatch initiated for <span className="text-primary">{selectedTier}</span> strategy.
                    </p>
                </div>
                
                <div className="pt-8">
                     <button 
                        onClick={() => {
                            setApprovalSuccess(false);
                            // In a real app, this might navigate back or fetch next anomaly
                            window.location.reload(); 
                        }}
                        className="px-6 py-2 bg-primary/10 text-primary border border-primary/50 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
         );
    }

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
                <button 
                    onClick={handleApproveStrategy}
                    disabled={isApproving}
                    className="bg-primary text-background-dark font-bold px-4 py-2 rounded shadow-[0_0_15px_rgba(6,249,249,0.3)] hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isApproving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    {isApproving ? 'Approving...' : 'Approve Strategy'}
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
