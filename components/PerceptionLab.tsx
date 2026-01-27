import React, { useState, useEffect, useRef } from 'react';
import { Camera, Maximize, AlertTriangle, CheckCircle, Crosshair, History, Cuboid, Video, Filter, Layers, Loader2 } from 'lucide-react';
import { analyzeVisualAnomaly } from '../services/geminiService';

interface LogEntry {
    id: number;
    timestamp: string;
    type: 'CRITICAL' | 'NORMAL';
    title: string;
    description: string;
    thumbnail?: string;
}

export const PerceptionLab: React.FC = () => {
    const [selectedFeed, setSelectedFeed] = useState('WTG-048');
    const [viewMode, setViewMode] = useState<'LIVE' | 'HISTORY' | '3D'>('LIVE');
    const [logFilter, setLogFilter] = useState<'ALL' | 'CRITICAL' | 'NORMAL'>('ALL');
    const [logs, setLogs] = useState<LogEntry[]>([
        { id: 1, timestamp: '09:41:12', type: 'CRITICAL', title: 'Micro-fracture', description: 'Confidence 94%. Zone 4 blade root.' },
        { id: 2, timestamp: '09:42:12', type: 'NORMAL', title: 'Surface Scan', description: 'Routine structural integrity check passed.' },
        { id: 3, timestamp: '09:43:12', type: 'NORMAL', title: 'Surface Scan', description: 'Routine structural integrity check passed.' },
    ]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const threeDCanvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [sliderValue, setSliderValue] = useState(50);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleCapture = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        try {
            setIsAnalyzing(true);
            // Capture low-res snapshot for log thumbnail
            const snapshot = canvas.toDataURL('image/jpeg', 0.6);
            
            // Call Gemini Service (or Simulator) to analyze the snapshot
            const analysis = await analyzeVisualAnomaly(snapshot);

            const newLog: LogEntry = {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                type: analysis.type,
                title: analysis.title,
                description: analysis.description,
                thumbnail: snapshot
            };

            setLogs(prev => [newLog, ...prev]);
        } catch (e) {
            console.error("Snapshot capture failed:", e);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Live Feed Animation
    useEffect(() => {
        if (viewMode !== 'LIVE') return;
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ensure video is playing
        if (video.paused) {
            video.play().catch(e => console.error("Video play failed:", e));
        }

        let animationFrameId: number;
        let scanLineY = 0;
        let scanDir = 2;

        const render = () => {
            if (!canvas || !ctx) return;

            // Resize handling
            const parent = canvas.parentElement;
            if (parent) {
                if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
                    canvas.width = parent.clientWidth;
                    canvas.height = parent.clientHeight;
                }
            }

            // 1. Draw Video Frame
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
                const x = (canvas.width / 2) - (video.videoWidth / 2) * scale;
                const y = (canvas.height / 2) - (video.videoHeight / 2) * scale;
                
                ctx.drawImage(video, x, y, video.videoWidth * scale, video.videoHeight * scale);
            } else {
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
            ctx.shadowBlur = 0;

            scanLineY += scanDir;
            if (scanLineY > canvas.height || scanLineY < 0) scanDir *= -1;

            // 4. Draw Digital Noise
            for (let i = 0; i < 30; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
                ctx.fillRect(x, y, 2, 2);
            }

            // 5. Draw Grid
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
    }, [viewMode]);

    // 3D Visualization Animation
    useEffect(() => {
        if (viewMode !== '3D') return;

        const canvas = threeDCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let angle = 0;

        const render = () => {
            if (!canvas || !ctx) return;
            
            // Resize handling
            const parent = canvas.parentElement;
            if (parent) {
                if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
                    canvas.width = parent.clientWidth;
                    canvas.height = parent.clientHeight;
                }
            }

            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;
            const cy = h / 2;

            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, w, h);

            // Draw 3D Wireframe "Turbine" (Simplified as rotating lines)
            ctx.strokeStyle = '#06f9f9';
            ctx.lineWidth = 2;
            ctx.save();
            ctx.translate(cx, cy);
            
            // Draw Tower
            ctx.beginPath();
            ctx.moveTo(0, 100);
            ctx.lineTo(0, 300);
            ctx.stroke();

            // Draw Hub
            ctx.beginPath();
            ctx.arc(0, 100, 10, 0, Math.PI * 2);
            ctx.stroke();

            // Draw Blades (Rotating)
            ctx.save();
            ctx.translate(0, 100);
            ctx.rotate(angle);
            
            for (let i = 0; i < 3; i++) {
                ctx.rotate((Math.PI * 2) / 3);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -120);
                ctx.stroke();
                
                // Blade details
                ctx.beginPath();
                ctx.moveTo(0, -20);
                ctx.quadraticCurveTo(20, -60, 0, -120);
                ctx.quadraticCurveTo(-20, -60, 0, -20);
                ctx.fillStyle = 'rgba(6, 249, 249, 0.1)';
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();

            // Draw defect marker in 3D space
            const defectX = Math.cos(angle) * 80;
            const defectY = Math.sin(angle) * 80 + 100;
            
            ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
            ctx.beginPath();
            ctx.arc(defectX, defectY - 100, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Defect label
            if (Math.sin(angle) > 0) { // Only show when "front"
                ctx.fillStyle = '#ff3333';
                ctx.font = '12px "JetBrains Mono"';
                ctx.fillText("CRACK DETECTED", defectX + 10, defectY - 100);
            }

            ctx.restore();

            angle += 0.02;
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [viewMode]);

    const filteredLogs = logs.filter(log => logFilter === 'ALL' || log.type === logFilter);

    return (
        <div className="flex h-full gap-6 max-w-[1600px] mx-auto">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Multimodal Perception Lab</h2>
                        <p className="text-sm text-text-muted">High-Fidelity Visual Anomaly Detection</p>
                    </div>
                    
                    {/* View Mode Toggle */}
                    <div className="flex bg-background-panel border border-primary-dim rounded-lg p-1 gap-1">
                        <button 
                            onClick={() => setViewMode('LIVE')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${viewMode === 'LIVE' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-text-muted hover:text-white'}`}
                        >
                            <Video className="w-4 h-4" />
                            LIVE FEED
                        </button>
                        <button 
                            onClick={() => setViewMode('HISTORY')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${viewMode === 'HISTORY' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-text-muted hover:text-white'}`}
                        >
                            <History className="w-4 h-4" />
                            HISTORY
                        </button>
                        <button 
                            onClick={() => setViewMode('3D')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${viewMode === '3D' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-text-muted hover:text-white'}`}
                        >
                            <Cuboid className="w-4 h-4" />
                            3D MODEL
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-black rounded-xl border border-primary-dim relative overflow-hidden group">
                    
                    {/* LIVE FEED VIEW */}
                    {viewMode === 'LIVE' && (
                        <>
                            <canvas ref={canvasRef} className="w-full h-full block" />
                            {/* Hidden Video Source */}
                            <video 
                                ref={videoRef}
                                src="/assets/drone_inspection.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="hidden"
                                onLoadedData={() => {
                                    // Trigger re-render or status update if needed
                                }}
                            />
                            
                            {/* Overlay UI */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-8 left-8 border-l-2 border-t-2 border-primary w-8 h-8"></div>
                                <div className="absolute top-8 right-8 border-r-2 border-t-2 border-primary w-8 h-8"></div>
                                <div className="absolute bottom-8 left-8 border-l-2 border-b-2 border-primary w-8 h-8"></div>
                                <div className="absolute bottom-8 right-8 border-r-2 border-b-2 border-primary w-8 h-8"></div>
                                
                                {/* Analysis Loading State */}
                                {isAnalyzing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                            <div className="text-primary font-mono text-sm font-bold animate-pulse">ANALYZING FRAME...</div>
                                        </div>
                                    </div>
                                )}

                                {/* Simulated Bounding Box */}
                                {!isAnalyzing && (
                                    <div className="absolute top-[30%] left-[40%] w-32 h-32 border-2 border-alert bg-alert/10 animate-pulse">
                                        <div className="absolute -top-6 left-0 bg-alert text-black text-xs font-bold px-2 py-0.5">
                                            CRACK [94%]
                                        </div>
                                    </div>
                                )}
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
                                    <button 
                                        onClick={handleCapture}
                                        disabled={isAnalyzing}
                                        className={`p-2 bg-background-panel border border-primary-dim rounded hover:bg-white/10 text-white transition-colors active:scale-95 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        title="Log Event & Snapshot"
                                    >
                                        <Camera className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 bg-background-panel border border-primary-dim rounded hover:bg-white/10 text-white transition-colors">
                                        <Maximize className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* HISTORY COMPARISON VIEW */}
                    {viewMode === 'HISTORY' && (
                        <div className="w-full h-full relative">
                            {/* Image 1 (Previous) */}
                            <div className="absolute inset-0">
                                <img 
                                    src="https://images.unsplash.com/photo-1535083145464-ba729d3d34fa?q=80&w=2600&auto=format&fit=crop" 
                                    className="w-full h-full object-cover filter grayscale contrast-125"
                                    alt="Historical"
                                />
                                <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded border border-white/20">
                                    PREVIOUS SCAN (2025-12-15)
                                </div>
                            </div>

                            {/* Image 2 (Current) - Clipped */}
                            <div 
                                className="absolute inset-0 overflow-hidden border-r-2 border-primary"
                                style={{ width: `${sliderValue}%` }}
                            >
                                <img 
                                    src="https://images.unsplash.com/photo-1535083145464-ba729d3d34fa?q=80&w=2600&auto=format&fit=crop" 
                                    className="w-full h-full object-cover max-w-none" 
                                    style={{ width: '100vw' }} // Hack to keep image scaling consistent
                                    alt="Current"
                                />
                                <div className="absolute top-4 right-4 bg-primary/80 text-black text-xs px-2 py-1 rounded font-bold">
                                    CURRENT FEED
                                </div>
                            </div>

                            {/* Slider Control */}
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={sliderValue} 
                                onChange={(e) => setSliderValue(Number(e.target.value))}
                                className="absolute inset-x-0 bottom-10 mx-auto w-3/4 z-20 cursor-ew-resize accent-primary"
                            />
                            
                            <div className="absolute bottom-4 inset-x-0 text-center text-xs text-text-muted font-mono">
                                DRAG TO COMPARE
                            </div>
                        </div>
                    )}

                    {/* 3D VISUALIZATION VIEW */}
                    {viewMode === '3D' && (
                        <div className="w-full h-full relative bg-[#050505]">
                            <canvas ref={threeDCanvasRef} className="w-full h-full block" />
                            <div className="absolute top-4 right-4 text-right">
                                <div className="text-primary font-mono text-xl font-bold">DIGITAL TWIN</div>
                                <div className="text-xs text-text-muted">REAL-TIME TELEMETRY MAPPING</div>
                            </div>
                            <div className="absolute bottom-8 left-8 space-y-2 font-mono text-xs">
                                <div className="flex gap-4">
                                    <span className="text-text-muted">ROTATION:</span>
                                    <span className="text-white">12.4 RPM</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-text-muted">PITCH:</span>
                                    <span className="text-white">4.2°</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-text-muted">YAW:</span>
                                    <span className="text-white">-15.8°</span>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Side Panel: Analysis */}
            <div className="w-full lg:w-80 flex flex-col gap-4 h-[400px] lg:h-auto flex-shrink-0">
                 <div className="bg-background-panel border border-primary-dim rounded-xl p-4 flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-4 border-b border-primary-dim pb-2">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Detection Log
                        </h3>
                        {/* Filter Controls */}
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setLogFilter('ALL')}
                                className={`p-1 rounded hover:bg-white/10 ${logFilter === 'ALL' ? 'text-primary' : 'text-text-muted'}`}
                                title="All Logs"
                            >
                                <Layers className="w-3 h-3" />
                            </button>
                            <button 
                                onClick={() => setLogFilter('CRITICAL')}
                                className={`p-1 rounded hover:bg-white/10 ${logFilter === 'CRITICAL' ? 'text-alert' : 'text-text-muted'}`}
                                title="Critical Only"
                            >
                                <AlertTriangle className="w-3 h-3" />
                            </button>
                            <button 
                                onClick={() => setLogFilter('NORMAL')}
                                className={`p-1 rounded hover:bg-white/10 ${logFilter === 'NORMAL' ? 'text-success' : 'text-text-muted'}`}
                                title="Normal Only"
                            >
                                <CheckCircle className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="bg-background-dark/50 p-3 rounded border border-primary-dim/30 hover:border-primary/50 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs text-text-muted font-mono">{log.timestamp}</span>
                                    <span className={`text-xs font-bold px-1.5 rounded ${log.type === 'CRITICAL' ? 'bg-alert/20 text-alert' : 'bg-success/20 text-success'}`}>
                                        {log.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-white font-medium mb-1">
                                    {log.type === 'CRITICAL' ? <AlertTriangle className="w-4 h-4 text-alert" /> : <CheckCircle className="w-4 h-4 text-success" />}
                                    {log.title}
                                </div>
                                <div className="text-xs text-text-muted">
                                    {log.description}
                                </div>
                                {log.thumbnail && (
                                    <div className="mt-2 rounded-lg overflow-hidden border border-primary-dim/50 relative group-hover:border-primary/50 transition-colors">
                                        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                                        <img src={log.thumbnail} alt="Event Snapshot" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {filteredLogs.length === 0 && (
                            <div className="text-center text-text-muted text-xs py-4">
                                No logs found for this filter.
                            </div>
                        )}
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
