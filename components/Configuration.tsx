import React, { useState } from 'react';
import { 
    Save, 
    Server, 
    Cpu, 
    Bell, 
    Shield, 
    Activity, 
    RefreshCw, 
    ToggleLeft, 
    ToggleRight, 
    CheckCircle,
    AlertCircle
} from 'lucide-react';

export const Configuration: React.FC = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        confidenceThreshold: 85,
        maxWindCutoff: 25,
        vibrationLimit: 8.5,
        thinkingBudget: 'High',
        autoDispatch: false,
        emailAlerts: true,
        slackIntegration: true,
    });

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
        }, 1500);
    };

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-primary-dim pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold text-white">System Configuration</h2>
                        <span className="px-2 py-0.5 bg-primary/10 border border-primary text-primary text-xs font-bold rounded uppercase font-mono">
                            Admin Access
                        </span>
                    </div>
                    <p className="text-text-muted">Global Parameters & Orchestration Settings</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`
                        flex items-center gap-2 px-6 py-2.5 rounded font-bold transition-all
                        ${isSaving 
                            ? 'bg-primary-dim text-primary border border-primary cursor-wait' 
                            : 'bg-primary text-background-dark hover:bg-primary-dark shadow-[0_0_15px_rgba(6,249,249,0.3)]'}
                    `}
                >
                    {isSaving ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            SYNCING...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            SAVE CHANGES
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* AI Orchestration Settings */}
                <div className="bg-background-panel border border-primary-dim rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-primary-dim bg-background-dark/50 flex items-center gap-3">
                        <Cpu className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">Orchestration Logic</h3>
                    </div>
                    <div className="p-6 space-y-8">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm text-text-muted">Anomaly Confidence Threshold</label>
                                <span className="text-primary font-mono font-bold">{settings.confidenceThreshold}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="50" 
                                max="99" 
                                value={settings.confidenceThreshold} 
                                onChange={(e) => setSettings({...settings, confidenceThreshold: parseInt(e.target.value)})}
                                className="w-full h-2 bg-background-dark rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <p className="text-xs text-text-muted mt-2">
                                Minimum AI confidence score required before flagging a critical anomaly.
                            </p>
                        </div>

                        <div>
                            <label className="text-sm text-text-muted block mb-3">Thinking Budget (Token Allocation)</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Low', 'Standard', 'High'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setSettings({...settings, thinkingBudget: level})}
                                        className={`
                                            py-2 px-4 rounded border text-sm font-bold transition-all
                                            ${settings.thinkingBudget === level 
                                                ? 'bg-primary/20 border-primary text-white shadow-[0_0_10px_rgba(6,249,249,0.2)]' 
                                                : 'bg-background-dark border-primary-dim text-text-muted hover:border-primary/50'}
                                        `}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-background-dark rounded border border-primary-dim">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-alert" />
                                <div>
                                    <div className="text-sm font-bold text-white">Autonomous Dispatch</div>
                                    <div className="text-xs text-text-muted">Allow AI to schedule repairs automatically</div>
                                </div>
                            </div>
                            <button onClick={() => toggleSetting('autoDispatch')} className="text-primary transition-colors">
                                {settings.autoDispatch 
                                    ? <ToggleRight className="w-8 h-8 text-primary" /> 
                                    : <ToggleLeft className="w-8 h-8 text-text-muted" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Operational Limits */}
                <div className="bg-background-panel border border-primary-dim rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-primary-dim bg-background-dark/50 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-alert" />
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">Safety Thresholds</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Max Wind Speed Cut-off (m/s)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    value={settings.maxWindCutoff}
                                    onChange={(e) => setSettings({...settings, maxWindCutoff: parseInt(e.target.value)})}
                                    className="bg-background-dark border border-primary-dim rounded p-2 text-white font-mono w-full focus:border-primary outline-none transition-colors"
                                />
                                <span className="text-xs text-text-muted whitespace-nowrap">Recommended: 25 m/s</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-text-muted">Critical Vibration Limit (mm/s)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={settings.vibrationLimit}
                                    onChange={(e) => setSettings({...settings, vibrationLimit: parseFloat(e.target.value)})}
                                    className="bg-background-dark border border-primary-dim rounded p-2 text-white font-mono w-full focus:border-primary outline-none transition-colors"
                                />
                                <span className="text-xs text-text-muted whitespace-nowrap">ISO Standard: 8.5</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-primary-dim">
                            <div className="flex items-center gap-3 text-sm text-text-muted">
                                <AlertCircle className="w-4 h-4 text-alert" />
                                Changes to safety thresholds require manual re-validation of existing tickets.
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Diagnostics */}
                <div className="bg-background-panel border border-primary-dim rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-primary-dim bg-background-dark/50 flex items-center gap-3">
                        <Server className="w-5 h-5 text-success" />
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">System Health</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {[
                                { name: 'Gemini 3 Pro API', status: 'Operational', latency: '45ms' },
                                { name: 'SCADA WebSocket Stream', status: 'Connected', latency: '12ms' },
                                { name: 'Drone Uplink (5G)', status: 'Standby', latency: '-' },
                                { name: 'Legacy SQL Database', status: 'Syncing', latency: '120ms' },
                            ].map((sys, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-background-dark rounded border border-primary-dim/30">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${sys.status === 'Operational' || sys.status === 'Connected' ? 'bg-success shadow-[0_0_5px_#0bda50]' : 'bg-primary'}`}></div>
                                        <span className="text-sm font-bold text-white">{sys.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-text-muted font-mono">{sys.latency}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${sys.status === 'Operational' || sys.status === 'Connected' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                                            {sys.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-background-panel border border-primary-dim rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-primary-dim bg-background-dark/50 flex items-center gap-3">
                        <Bell className="w-5 h-5 text-white" />
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">Alerts & Notifications</h3>
                    </div>
                    <div className="p-6 space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm text-white font-bold">Critical Email Alerts</span>
                                <span className="text-xs text-text-muted">Immediate notification for Severity: HIGH+</span>
                            </div>
                            <button onClick={() => toggleSetting('emailAlerts')} className="text-primary transition-colors">
                                {settings.emailAlerts 
                                    ? <ToggleRight className="w-8 h-8 text-primary" /> 
                                    : <ToggleLeft className="w-8 h-8 text-text-muted" />}
                            </button>
                        </div>
                        <div className="w-full h-px bg-primary-dim"></div>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm text-white font-bold">Slack Channel Integration</span>
                                <span className="text-xs text-text-muted">Post daily summaries to #ops-maintenance</span>
                            </div>
                            <button onClick={() => toggleSetting('slackIntegration')} className="text-primary transition-colors">
                                {settings.slackIntegration 
                                    ? <ToggleRight className="w-8 h-8 text-primary" /> 
                                    : <ToggleLeft className="w-8 h-8 text-text-muted" />}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};