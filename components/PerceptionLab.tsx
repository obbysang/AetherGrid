import React, { useState, useEffect, useRef } from 'react';
import { Camera, Maximize, AlertTriangle, CheckCircle, Crosshair } from 'lucide-react';

export const PerceptionLab: React.FC = () => {
    const [selectedFeed, setSelectedFeed] = useState('WTG-048');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        // High-quality industrial wind turbine image
        img.src = "https://images.unsplash.com/photo-1535083145464-ba729d3d34fa?q=80&w=2600&auto=format&fit=crop";

        let animationFrameId: number;
        let scanLineY = 0;
        let scanDir = 2;

        const render = () => {
            if (!canvas || !ctx) return;

            // Resize handling: ensure canvas internal resolution matches display size
            const parent = canvas.parentElement;
            if (parent) {
                if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
                    canvas.width = parent.clientWidth;
                    canvas.height = parent.clientHeight;
                }
            }

            // 1. Draw Background Image (scaled to cover)
            // Critical fix: Check img.naturalWidth to ensure image is not in 'broken' state
            if (img.complete && img.naturalWidth > 0) {
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;
                
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            } else {
                // Loading Placeholder or Error State
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#06f9f9';
                ctx.font = '14px "JetBrains Mono"';
                ctx.fillText("ESTABLISHING LINK...", 40, canvas.height / 2);
            }

            // 2. Apply "Sensor" Tint
            ctx.fillStyle = 'rgba(6, 249, 249, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 3. Draw Scan Line
            ctx.shadowColor = '#06f9f9';
            ctx.shadowBlur = 15;
            ctx.fillStyle = 'rgba(6, 249, 249, 0.4)';
            ctx.fillRect(0, scanLineY, canvas.width, 2);
            ctx.shadowBlur = 0; // Reset shadow for performance

            // Update scan line position
            scanLineY += scanDir;
            if (scanLineY > canvas.height || scanLineY < 0) scanDir *= -1;

            // 4. Draw Digital Noise / Grain
            for (let i = 0; i < 30; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
                ctx.fillRect(x, y, 2, 2);
            }

            // 5. Draw faint grid lines
            ctx.strokeStyle = 'rgba(6, 249, 249, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let x = 0; x < canvas.width; x += 100) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
            }
            ctx.stroke();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="flex h-full gap-6 max-w-[1600px] mx-auto">
            {/* Main Video Feed Area */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Multimodal Perception Lab</h2>
                        <p className="text-sm text-text-muted">High-Fidelity Visual Anomaly Detection</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono bg-background-panel border border-primary-dim px-3 py-1 rounded">
                         <span className="w-2 h-2 bg-alert rounded-full animate-pulse"></span>
                         LIVE FEED: {selectedFeed}
                    </div>
                </div>

                <div className="flex-1 bg-black rounded-xl border border-primary-dim relative overflow-hidden group">
                    {/* Simulated Live Feed Canvas */}
                    <canvas ref={canvasRef} className="w-full h-full block" />
                    
                    {/* Overlay UI */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-8 left-8 border-l-2 border-t-2 border-primary w-8 h-8"></div>
                        <div className="absolute top-8 right-8 border-r-2 border-t-2 border-primary w-8 h-8"></div>
                        <div className="absolute bottom-8 left-8 border-l-2 border-b-2 border-primary w-8 h-8"></div>
                        <div className="absolute bottom-8 right-8 border-r-2 border-b-2 border-primary w-8 h-8"></div>
                        
                        {/* Simulated Bounding Box */}
                        <div className="absolute top-[30%] left-[40%] w-32 h-32 border-2 border-alert bg-alert/10 animate-pulse">
                            <div className="absolute -top-6 left-0 bg-alert text-black text-xs font-bold px-2 py-0.5">
                                CRACK [94%]
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex justify-between items-end pointer-events-none">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-primary font-mono text-sm">
                                <Crosshair className="w-4 h-4" />
                                TARGET LOCK: BLADE-B
                            </div>
                            <div className="text-xs text-text-muted font-mono">
                                ISO: 800 | APERTURE: f/2.8 | THERMAL: OFF | 60 FPS
                            </div>
                        </div>
                        <div className="flex gap-2 pointer-events-auto">
                             <button className="p-2 bg-background-panel border border-primary-dim rounded hover:bg-white/10 text-white transition-colors">
                                <Camera className="w-5 h-5" />
                             </button>
                             <button className="p-2 bg-background-panel border border-primary-dim rounded hover:bg-white/10 text-white transition-colors">
                                <Maximize className="w-5 h-5" />
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Panel: Analysis */}
            <div className="w-80 flex flex-col gap-4">
                 <div className="bg-background-panel border border-primary-dim rounded-xl p-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-primary-dim pb-2">
                        Detection Log
                    </h3>
                    <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-background-dark/50 p-3 rounded border border-primary-dim/30 hover:border-primary/50 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs text-text-muted font-mono">09:4{i}:12</span>
                                    <span className={`text-xs font-bold px-1.5 rounded ${i === 1 ? 'bg-alert/20 text-alert' : 'bg-success/20 text-success'}`}>
                                        {i === 1 ? 'CRITICAL' : 'NORMAL'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-white font-medium mb-1">
                                    {i === 1 ? <AlertTriangle className="w-4 h-4 text-alert" /> : <CheckCircle className="w-4 h-4 text-success" />}
                                    {i === 1 ? 'Micro-fracture' : 'Surface Scan'}
                                </div>
                                <div className="text-xs text-text-muted">
                                    {i === 1 ? 'Confidence 94%. Zone 4 blade root.' : 'Routine structural integrity check passed.'}
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>

                 <div className="bg-background-panel border border-primary-dim rounded-xl p-4 h-1/3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                        Data Fusion
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs text-text-muted mb-1">
                                <span>Thermal Stress</span>
                                <span className="text-white">Normal</span>
                            </div>
                            <div className="w-full h-1 bg-background-dark rounded-full">
                                <div className="h-full w-[40%] bg-success rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-text-muted mb-1">
                                <span>Vibration Correlation</span>
                                <span className="text-alert font-bold">High</span>
                            </div>
                            <div className="w-full h-1 bg-background-dark rounded-full">
                                <div className="h-full w-[85%] bg-alert rounded-full"></div>
                            </div>
                        </div>
                        <div className="text-xs text-text-muted mt-4 bg-primary/5 p-2 rounded border border-primary/20">
                            <span className="text-primary font-bold">AI Insight:</span> Visual anomaly correlates with 85% spike in vibration sensor 4B. Likely root cause confirmed.
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};