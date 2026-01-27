import React, { useState, useEffect } from 'react';
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
    AlertCircle,
    AlertTriangle,
    Key
} from 'lucide-react';

interface SystemSettings {
    confidenceThreshold: number;
    maxWindCutoff: number;
    vibrationLimit: number;
    thinkingBudget: 'Low' | 'Standard' | 'High';
    autoDispatch: boolean;
    emailAlerts: boolean;
    slackIntegration: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
    confidenceThreshold: 85,
    maxWindCutoff: 25,
    vibrationLimit: 8.5,
    thinkingBudget: 'High',
    autoDispatch: false,
    emailAlerts: true,
    slackIntegration: true,
};

export const Configuration: React.FC = () => {
    // Load settings from LocalStorage or fallback to default
    const [settings, setSettings] = useState<SystemSettings>(() => {
        const saved = localStorage.getItem('aethergrid_config');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [hasApiKey, setHasApiKey] = useState(false);
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');

    // Jitter effect for system health monitoring
    const [latencies, setLatencies] = useState({ api: 45, scada: 12, db: 120 });
    
    useEffect(() => {
        const interval = setInterval(() => {
            setLatencies({
                api: Math.max(20, Math.floor(45 + (Math.random() * 10 - 5))),
                scada: Math.max(5, Math.floor(12 + (Math.random() * 4 - 2))),
                db: Math.max(80, Math.floor(120 + (Math.random() * 20 - 10))),
            });
        }, 2000);
        
        // Check for API Key presence on mount
        checkApiKey();

        return () => clearInterval(interval);
    }, []);

    const checkApiKey = async () => {
        if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
            const has = await (window as any).aistudio.hasSelectedApiKey();
            setHasApiKey(has);
        } else if (process.env.API_KEY || localStorage.getItem('gemini_api_key')) {
            setHasApiKey(true);
        }
    };

    const handleKeySelection = async () => {
        if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
            await (window as any).aistudio.openSelectKey();
            // Assume success after dialog interaction to avoid race conditions
            setHasApiKey(true);
        } else {
            // Fallback for local development
            setShowKeyInput(!showKeyInput);
            setMessage("");
        }
    };

    const handleSaveKey = () => {
        if (apiKeyInput.trim().length > 0) {
            localStorage.setItem('gemini_api_key', apiKeyInput.trim());
            setHasApiKey(true);
            setShowKeyInput(false);
            setApiKeyInput('');
            setMessage("API Key saved locally.");
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 3000);
        }
    };

    const handleSave = () => {
        setStatus('saving');
        setMessage('');

        // Input Validation
        if (settings.maxWindCutoff < 10 || settings.maxWindCutoff > 50) {
            setStatus('error');
            setMessage('Wind cutoff must be between 10 and 50 m/s for safety.');
            return;
        }

        if (settings.vibrationLimit < 1 || settings.vibrationLimit > 20) {
            setStatus('error');
            setMessage('Vibration limit must be reasonable (1-20 mm/s).');
            return;
        }

        if (settings.confidenceThreshold < 50 || settings.confidenceThreshold > 99) {
            setStatus('error');
            setMessage('Confidence threshold must be between 50% and 99%.');
            return;
        }

        // Simulate API Persistence
        setTimeout(() => {
            try {
                localStorage.setItem('aethergrid_config', JSON.stringify(settings));
                setStatus('success');
                setMessage('Configuration successfully synced to Agent Swarm.');
                
                // Reset status after 3 seconds
                setTimeout(() => {
                    setStatus('idle');
                    setMessage('');
                }, 3000);
            } catch (error) {
                setStatus('error');
                setMessage('Local storage write failed.');
            }
        }, 800);
    };

    const toggleSetting = (key: keyof Pick<SystemSettings, 'autoDispatch' | 'emailAlerts' | 'slackIntegration'>) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-primary-dim pb-6 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-bold text-white">System Configuration</h2>
                        <span className="px-2 py-0.5 bg-primary/10 border border-primary text-primary text-xs font-bold rounded uppercase font-mono">
                            Admin Access
                        </span>
                    </div>
                    <p className="text-text-muted">Global Parameters & Orchestration Settings</p>
                </div>
                
                <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                    <button 
                        onClick={handleSave}
                        disabled={status === 'saving'}
                        className={`
                            flex items-center justify-center gap-2 px-6 py-2.5 rounded font-bold transition-all w-full md:w-auto
                            ${status === 'saving'
                                ? 'bg-primary-dim text-primary border border-primary cursor-wait' 
                                : status === 'success'
                                ? 'bg-success text-background-dark cursor-default'
                                : 'bg-primary text-background-dark hover:bg-primary-dark shadow-[0_0_15px_rgba(6,249,249,0.3)]'}
                        `}
                    >
                        {status === 'saving' ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                SYNCING...
                            </>
                        ) : status === 'success' ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                SAVED
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                SAVE CHANGES
                            </>
                        )}
                    </button>
                    
                    {/* Status Message Feedback */}
                    {message && (
                        <div className={`text-xs font-bold flex items-center gap-1.5 animate-fade-in ${status === 'error' ? 'text-alert' : 'text-success'}`}>
                            {status === 'error' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {message}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* API Authorization (New) */}
                <div className="bg-background-panel border border-primary-dim rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="p-4 border-b border-primary-dim bg-background-dark/50 flex items-center gap-3">
                        <Key className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">Gemini API Authorization</h3>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${hasApiKey ? 'bg-success shadow-[0_0_8px_#0bda50] animate-pulse' : 'bg-alert shadow-[0_0_8px_#fa5c38]'}`}></div>
                                <div>
                                    <div className="text-sm font-bold text-white">{hasApiKey ? 'Authenticated' : 'Missing Credentials'}</div>
                                    <div className="text-xs text-text-muted">{hasApiKey ? 'Gemini 3 Pro Access: GRANTED' : 'Access Restricted'}</div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleKeySelection}
                                className={`px-4 py-2 rounded text-xs font-bold border transition-colors ${hasApiKey ? 'border-primary-dim text-text-muted hover:text-white hover:bg-white/5' : 'bg-primary text-background-dark hover:bg-primary-dark'}`}
                            >
                                {hasApiKey ? 'CHANGE KEY' : 'CONNECT GEMIINI 3 API KEY'}
                            </button>
                        </div>
                        
                        {showKeyInput && (
                            <div className="mt-4 flex gap-2 animate-fade-in">
                                <input 
                                    type="password"
                                    placeholder="Enter Gemini API Key"
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    className="flex-1 bg-background-dark border border-primary-dim rounded p-2 text-white text-sm focus:border-primary outline-none"
                                />
                                <button
                                    onClick={handleSaveKey}
                                    className="px-4 py-2 bg-success text-background-dark rounded text-xs font-bold hover:bg-success-bright"
                                >
                                    SAVE
                                </button>
                            </div>
                        )}

                        <p className="text-xs text-text-muted mt-4 p-3 bg-background-dark rounded border border-primary-dim">
                            <span className="text-primary font-bold">Security Note:</span> Keys are injected via environment runtime (process.env.API_KEY). For local development, keys can be stored in browser LocalStorage.
                        </p>
                    </div>
                </div>

                {/* AI Orchestration Settings */}
                <div className="bg-background-panel border border-primary-dim rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="p-4 border-b border-primary-dim bg-background-dark/50 flex items-center gap-3">
                        <Cpu className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">Orchestration Logic</h3>
                    </div>
                    <div className="p-6 space-y-8">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm text-text-muted">Anomaly Confidence Threshold</label>
                                <span className={`font-mono font-bold ${settings.confidenceThreshold < 70 ? 'text-alert' : 'text-primary'}`}>
                                    {settings.confidenceThreshold}%
                                </span>
                            </div>
                            <div className="relative w-full h-6 flex items-center">
                                <input 
                                    type="range" 
                                    min="50" 
                                    max="99" 
                                    value={settings.confidenceThreshold} 
                                    onChange={(e) => setSettings({...settings, confidenceThreshold: parseInt(e.target.value)})}
                                    className="w-full h-2 bg-background-dark rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                                />
                            </div>
                            <p className="text-xs text-text-muted mt-2 flex justify-between">
                                <span>Sensitive (50%)</span>
                                <span>Strict (99%)</span>
                            </p>
                        </div>

                        <div>
                            <label className="text-sm text-text-muted block mb-3">Thinking Budget (Token Allocation)</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['Low', 'Standard', 'High'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setSettings({...settings, thinkingBudget: level})}
                                        className={`
                                            py-2 px-4 rounded border text-sm font-bold transition-all duration-200
                                            ${settings.thinkingBudget === level 
                                                ? 'bg-primary/20 border-primary text-white shadow-[0_0_10px_rgba(6,249,249,0.2)] scale-105' 
                                                : 'bg-background-dark border-primary-dim text-text-muted hover:border-primary/50 hover:text-white'}
                                        `}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-text-muted mt-2">
                                Controls Gemini 3 Pro reasoning depth. 'High' recommended for root cause analysis.
                            </p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-background-dark rounded border border-primary-dim hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <Shield className={`w-5 h-5 ${settings.autoDispatch ? 'text-primary' : 'text-text-muted'}`} />
                                <div>
                                    <div className="text-sm font-bold text-white">Autonomous Dispatch</div>
                                    <div className="text-xs text-text-muted">Allow AI to schedule repairs automatically</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggleSetting('autoDispatch')} 
                                className="transition-colors focus:outline-none"
                                title={settings.autoDispatch ? 'Disable' : 'Enable'}
                            >
                                {settings.autoDispatch 
                                    ? <ToggleRight className="w-9 h-9 text-primary cursor-pointer hover:text-primary-dark" /> 
                                    : <ToggleLeft className="w-9 h-9 text-text-muted cursor-pointer hover:text-white" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Operational Limits */}
                <div className="bg-background-panel border border-primary-dim rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="p-4 border-b border-primary-dim bg-background-dark/50 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-alert" />
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">Safety Thresholds</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-2 group">
                            <label className="text-sm text-text-muted group-focus-within:text-white transition-colors">Max Wind Speed Cut-off (m/s)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    min="0"
                                    max="100"
                                    value={settings.maxWindCutoff}
                                    onChange={(e) => setSettings({...settings, maxWindCutoff: Number(e.target.value)})}
                                    className="bg-background-dark border border-primary-dim rounded p-2 text-white font-mono w-full focus:border-primary outline-none transition-all focus:shadow-[0_0_10px_rgba(6,249,249,0.1)]"
                                />
                                <span className="text-xs text-text-muted whitespace-nowrap bg-background-darker px-2 py-1 rounded border border-primary-dim">
                                    Default: 25
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-sm text-text-muted group-focus-within:text-white transition-colors">Critical Vibration Limit (mm/s)</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="number" 
                                    step="0.1"
                                    min="0"
                                    max="50"
                                    value={settings.vibrationLimit}
                                    onChange={(e) => setSettings({...settings, vibrationLimit: Number(e.target.value)})}
                                    className="bg-background-dark border border-primary-dim rounded p-2 text-white font-mono w-full focus:border-primary outline-none transition-all focus:shadow-[0_0_10px_rgba(6,249,249,0.1)]"
                                />
                                <span className="text-xs text-text-muted whitespace-nowrap bg-background-darker px-2 py-1 rounded border border-primary-dim">
                                    ISO: 8.5
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-primary-dim">
                            <div className="flex items-center gap-3 text-sm text-text-muted">
                                <AlertCircle className="w-4 h-4 text-alert" />
                                Changes trigger re-validation of open tickets.
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Diagnostics */}
                <div className="bg-background-panel border border-primary-dim rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="p-4 border-b border-primary-dim bg-background-dark/50 flex items-center gap-3">
                        <Server className="w-5 h-5 text-success" />
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">System Health</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {[
                                { name: 'Gemini 3 Pro API', status: hasApiKey ? 'Operational' : 'No Access', latency: hasApiKey ? `${latencies.api}ms` : 'ERR' },
                                { name: 'SCADA WebSocket', status: 'Connected', latency: `${latencies.scada}ms` },
                                { name: 'Drone Uplink (5G)', status: 'Standby', latency: '-' },
                                { name: 'Legacy SQL DB', status: 'Syncing', latency: `${latencies.db}ms` },
                            ].map((sys, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-background-dark rounded border border-primary-dim/30 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${sys.status === 'Operational' || sys.status === 'Connected' ? 'bg-success shadow-[0_0_5px_#0bda50] animate-pulse' : 'bg-alert'}`}></div>
                                        <span className="text-sm font-bold text-white">{sys.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs text-text-muted font-mono w-12 text-right">{sys.latency}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded min-w-[80px] text-center font-bold ${sys.status === 'Operational' || sys.status === 'Connected' ? 'bg-success/20 text-success' : 'bg-alert/20 text-alert'}`}>
                                            {sys.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-background-panel border border-primary-dim rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
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
                            <button onClick={() => toggleSetting('emailAlerts')} className="transition-colors focus:outline-none">
                                {settings.emailAlerts 
                                    ? <ToggleRight className="w-9 h-9 text-primary cursor-pointer hover:text-primary-dark" /> 
                                    : <ToggleLeft className="w-9 h-9 text-text-muted cursor-pointer hover:text-white" />}
                            </button>
                        </div>
                        <div className="w-full h-px bg-primary-dim"></div>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm text-white font-bold">Slack Channel Integration</span>
                                <span className="text-xs text-text-muted">Post daily summaries to #ops-maintenance</span>
                            </div>
                            <button onClick={() => toggleSetting('slackIntegration')} className="transition-colors focus:outline-none">
                                {settings.slackIntegration 
                                    ? <ToggleRight className="w-9 h-9 text-primary cursor-pointer hover:text-primary-dark" /> 
                                    : <ToggleLeft className="w-9 h-9 text-text-muted cursor-pointer hover:text-white" />}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};