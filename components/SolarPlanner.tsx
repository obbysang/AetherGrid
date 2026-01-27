
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sun, Map, DollarSign, BatteryCharging, ArrowRight, Layers, MapPin, X, Check } from 'lucide-react';
import { executeSolarPlanning } from '../services/geminiService';
import { SolarPotential } from '../types';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to handle map clicks, drag, and resize
const MapController = ({ position, setPosition }: { position: { lat: number, lng: number }, setPosition: (pos: { lat: number, lng: number }) => void }) => {
    const map = useMap();
    const markerRef = useRef<L.Marker>(null);
    
    // Fix map rendering in modal
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    
    // Fly to new position when it changes
    useEffect(() => {
        map.flyTo([position.lat, position.lng], map.getZoom());
    }, [position.lat, position.lng, map]);

    useMapEvents({
        click(e) {
            setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const newPos = marker.getLatLng();
                    setPosition({ lat: newPos.lat, lng: newPos.lng });
                }
            },
        }),
        [setPosition],
    );

    return position === null ? null : (
        <Marker 
            draggable={true}
            eventHandlers={eventHandlers}
            position={position} 
            ref={markerRef}
        />
    );
};

export const SolarPlanner: React.FC = () => {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<SolarPotential | null>(null);
    const [coordinates, setCoordinates] = useState({ lat: 51.5074, lng: -0.1278 });
    const [showMapModal, setShowMapModal] = useState(false);
    const [tempCoordinates, setTempCoordinates] = useState({ lat: 51.5074, lng: -0.1278 });

    // Get user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const userPos = { lat: latitude, lng: longitude };
                    setCoordinates(userPos);
                    setTempCoordinates(userPos);
                },
                (error) => {
                    console.log("Geolocation denied or unavailable, using default location.");
                }
            );
        }
    }, []);

    const handleAnalysis = async () => {
        setAnalyzing(true);
        try {
            const data = await executeSolarPlanning(coordinates.lat, coordinates.lng);
            setResult(data);
        } catch (e) {
            alert("Failed to analyze solar potential");
        } finally {
            setAnalyzing(false);
        }
    };

    const openMapModal = () => {
        setTempCoordinates(coordinates);
        setShowMapModal(true);
    };

    const confirmMapSelection = () => {
        setCoordinates(tempCoordinates);
        setShowMapModal(false);
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
                <div 
                    className="lg:col-span-2 bg-black rounded-xl border border-primary-dim relative overflow-hidden group cursor-pointer"
                    onClick={openMapModal}
                >
                     {/* Placeholder for Google Maps Solar API Visual - Keeps static preview */}
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1624397640148-949b1732bb0a?q=80&w=2600&auto=format&fit=crop')] bg-cover opacity-60 group-hover:opacity-40 transition-opacity"></div>
                     <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                     
                     {/* Static Marker Preview */}
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <MapPin className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
                     </div>
                     
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                         <div className="bg-black/80 px-4 py-2 rounded-full border border-primary text-primary font-bold text-sm">
                             CLICK TO OPEN MAP
                         </div>
                     </div>

                     {/* Map Overlay UI */}
                     <div 
                        className="absolute top-4 left-4 bg-background-dark/90 border border-primary-dim p-4 rounded-lg backdrop-blur-md w-80 z-30"
                        onClick={(e) => e.stopPropagation()} // Prevent map click when clicking UI
                     >
                         <div className="flex items-center gap-2 mb-4">
                             <Map className="w-4 h-4 text-primary" />
                             <span className="text-sm font-bold text-white">Target Selection</span>
                         </div>
                         <div className="space-y-3">
                             <div className="grid grid-cols-2 gap-2">
                                 <div className="relative">
                                     <label className="text-xs text-text-muted block mb-1">Latitude</label>
                                     <input 
                                        type="number" 
                                        value={coordinates.lat} 
                                        onChange={(e) => setCoordinates(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                                        className="w-full bg-background-panel border border-primary-dim rounded p-2 text-xs text-white" 
                                        step="0.000001"
                                     />
                                 </div>
                                 <div className="relative">
                                     <label className="text-xs text-text-muted block mb-1">Longitude</label>
                                     <input 
                                        type="number" 
                                        value={coordinates.lng} 
                                        onChange={(e) => setCoordinates(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
                                        className="w-full bg-background-panel border border-primary-dim rounded p-2 text-xs text-white" 
                                        step="0.000001"
                                     />
                                 </div>
                             </div>
                             
                             <button 
                                onClick={openMapModal}
                                className="w-full py-1.5 border border-primary/30 bg-primary/5 text-primary rounded text-xs font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <MapPin className="w-3 h-3" />
                                SELECT ON MAP
                            </button>

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

                     {/* Map Selection Modal */}
                     {showMapModal && (
                        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in">
                            <div className="w-full h-full bg-background-dark border border-primary-dim rounded-xl overflow-hidden relative flex flex-col shadow-2xl">
                                <div className="p-4 border-b border-primary-dim flex justify-between items-center bg-background-panel z-10">
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        Select Target Location
                                    </h3>
                                    <button onClick={() => setShowMapModal(false)} className="text-text-muted hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="flex-1 relative overflow-hidden bg-background-dark">
                                    <MapContainer 
                                        center={[tempCoordinates.lat, tempCoordinates.lng]} 
                                        zoom={18} 
                                        style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            className="map-tiles"
                                        />
                                        <MapController 
                                            position={tempCoordinates} 
                                            setPosition={(pos) => setTempCoordinates(pos)} 
                                        />
                                    </MapContainer>

                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-xs text-white backdrop-blur-md pointer-events-none z-[400]">
                                        Click map or drag pin to update location
                                    </div>
                                </div>

                                <div className="p-4 border-t border-primary-dim bg-background-panel flex justify-between items-center z-10">
                                    <div className="text-xs text-text-muted">
                                        Selected: <span className="text-primary font-mono">{tempCoordinates.lat.toFixed(4)}, {tempCoordinates.lng.toFixed(4)}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setShowMapModal(false)}
                                            className="px-4 py-2 rounded text-xs font-bold text-text-muted hover:text-white transition-colors"
                                        >
                                            CANCEL
                                        </button>
                                        <button 
                                            onClick={confirmMapSelection}
                                            className="px-4 py-2 bg-primary text-background-dark rounded text-xs font-bold hover:bg-primary-dark transition-colors flex items-center gap-2"
                                        >
                                            <Check className="w-3 h-3" />
                                            CONFIRM LOCATION
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                     )}

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
                                        <div className="text-xl font-bold text-primary font-mono">{result.totalSolarFluxKwh.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs">kWh/yr</span></div>
                                    </div>
                                    <div className="p-3 bg-background-dark rounded border border-primary-dim">
                                        <div className="text-xs text-text-muted mb-1">Usable Area</div>
                                        <div className="text-xl font-bold text-white font-mono">{result.areaSqM?.toFixed(0)} <span className="text-xs">m²</span></div>
                                    </div>
                                    <div className="p-3 bg-background-dark rounded border border-primary-dim">
                                        <div className="text-xs text-text-muted mb-1">Panel Count</div>
                                        <div className="text-xl font-bold text-white font-mono">{result.optimalPanelCount} <span className="text-xs">units</span></div>
                                    </div>
                                    <div className="p-3 bg-background-dark rounded border border-primary-dim">
                                        <div className="text-xs text-text-muted mb-1">Shade Loss</div>
                                        <div className="text-xl font-bold text-alert font-mono">{result.shadeLossPercentage}%</div>
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
                                            <div className="text-2xl font-bold text-white">${result.financialProjections.annualSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-success/80">Payback Period</div>
                                            <div className="text-2xl font-bold text-white">{result.financialProjections.paybackPeriod.toFixed(1)} <span className="text-sm font-normal">yrs</span></div>
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
