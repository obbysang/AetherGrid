
import React, { useState } from 'react';
import { Wind, Lock, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginProps {
    onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.login(password);
            onLogin();
        } catch (e) {
            setError('Access Denied: Invalid Security Clearance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-background-dark flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=2600&auto=format&fit=crop')] bg-cover opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,249,249,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,249,249,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <div className="relative z-10 w-full max-w-md p-6 md:p-8 mx-4 bg-background-panel/80 backdrop-blur-xl border border-primary-dim rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary mb-4 animate-pulse-slow">
                        <Wind className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-widest text-white">AETHER<span className="text-primary">GRID</span></h1>
                    <p className="text-text-muted text-sm mt-2 font-mono uppercase tracking-wide">Autonomous Infrastructure Sentinel</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase">Security Token</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-background-dark border border-primary-dim rounded-lg py-3 pl-10 pr-4 text-white placeholder-text-muted/50 focus:border-primary outline-none transition-colors font-mono"
                                placeholder="Enter access code..."
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-alert/10 border border-alert/30 rounded text-alert text-xs font-bold text-center animate-fade-in">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-primary text-background-dark font-bold py-3 rounded-lg hover:bg-primary-dark transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'AUTHENTICATING...' : 'INITIATE SESSION'}
                        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-text-muted font-mono">
                        RESTRICTED ACCESS // SECTOR 7 // GEMINI PROTOCOL
                    </p>
                    <p className="text-[10px] text-primary/50 mt-1 font-mono cursor-pointer hover:text-primary" onClick={() => setPassword('gemini2026')}>
                        (Hint: gemini2026)
                    </p>
                </div>
            </div>
        </div>
    );
};
