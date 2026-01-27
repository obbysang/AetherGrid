
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sun, Map, DollarSign, BatteryCharging, ArrowRight, Layers, MapPin, X, Check, Calculator, Calendar, BarChart3, Search } from 'lucide-react';
import { executeSolarPlanning } from '../services/geminiService';
import { SolarPotential } from '../types';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle, Popup } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
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
const MapController = ({ position, setPosition, isInteractive }: { position: { lat: number, lng: number }, setPosition: (pos: { lat: number, lng: number }) => void, isInteractive: boolean }) => {
    const map = useMap();
    const markerRef = useRef<L.Marker>(null);
    
    // Fly to new position when it changes
    useEffect(() => {
        map.flyTo([position.lat, position.lng], map.getZoom());
    }, [position.lat, position.lng, map]);

    useMapEvents({
        click(e) {
            if (isInteractive) {
                setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
            }
        },
    });

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null && isInteractive) {
                    const newPos = marker.getLatLng();
                    setPosition({ lat: newPos.lat, lng: newPos.lng });
                }
            },
        }),
        [setPosition, isInteractive],
    );

    return position === null ? null : (
        <Marker 
            draggable={isInteractive}
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
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    
    // Financial inputs
    const [electricityRate, setElectricityRate] = useState(0.15); // $/kWh
    const [panelCost, setPanelCost] = useState(800); // $ per panel

    // Get user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const userPos = { lat: latitude, lng: longitude };
                    setCoordinates(userPos);
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

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) });
            } else {
                alert('Location not found');
            }
        } catch (error) {
            console.error('Search failed:', error);
            alert('Search failed. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    // Derived Financials (Client-side recalculation)
    const financials = useMemo(() => {
        if (!result) return null;
        const installationCost = result.optimalPanelCount * panelCost;
        const annualSavings = result.totalSolarFluxKwh * electricityRate;
        const paybackPeriod = annualSavings > 0 ? installationCost / annualSavings : 0;
        
        return {
            installationCost,
            annualSavings,
            paybackPeriod
        };
    }, [result, electricityRate, panelCost]);

    // Prepare Chart Data (Summer vs Winter Solstice approximation)
    const chartData = useMemo(() => {
        if (!result?.hourlyFluxMap) return [];
        
        // Approximate indices: June 21 (172nd day) -> hours ~4128-4152
        // Dec 21 (355th day) -> hours ~8520-8544
        const summerStart = 172 * 24;
        const winterStart = 355 * 24;

        const data = [];
        for (let i = 0; i < 24; i++) {
            data.push({
                hour: `${i}:00`,
                Summer: result.hourlyFluxMap[summerStart + i] || 0,
                Winter: result.hourlyFluxMap[winterStart + i] || 0,
            });
        }
        return data;
    }, [result]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 h-full flex flex-col pb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end flex-shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Solar Resource Planner</h1>
                    <p className="text-text-muted text-sm">Rooftop Optimization • Satellite Flux Mapping • Financial Modeling</p>
                </div>
                <div className="flex gap-3 items-end">
                     {/* Search and Location Controls */}
                     <div className="bg-background-panel border border-primary-dim rounded-lg p-1.5 flex items-center gap-3 shadow-lg">
                        <div className="flex items-center gap-2">
                             <Search className="w-4 h-4 text-primary ml-1" />
                             <form onSubmit={handleSearch} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search location..."
                                    className="w-48 bg-background-dark border border-primary-dim rounded px-2 py-1 text-xs text-white placeholder:text-text-muted focus:border-primary outline-none" 
                                />
                                <button 
                                    type="submit"
                                    disabled={isSearching}
                                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded px-2 py-1 text-xs font-bold transition-colors"
                                >
                                    {isSearching ? '...' : 'GO'}
                                </button>
                            </form>
                        </div>
                        
                        <div className="w-px h-6 bg-primary-dim"></div>

                        <div className="flex items-center gap-2">
                             <MapPin className="w-4 h-4 text-primary" />
                             <div className="flex gap-1">
                                <input 
                                    type="number" 
                                    value={coordinates.lat} 
                                    onChange={(e) => setCoordinates(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                                    className="w-20 bg-background-dark border border-primary-dim rounded px-2 py-1 text-xs text-white focus:border-primary outline-none" 
                                    step="0.0001"
                                />
                                <input 
                                    type="number" 
                                    value={coordinates.lng} 
                                    onChange={(e) => setCoordinates(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
                                    className="w-20 bg-background-dark border border-primary-dim rounded px-2 py-1 text-xs text-white focus:border-primary outline-none" 
                                    step="0.0001"
                                />
                             </div>
                        </div>
                     </div>

                     <div className="px-3 py-1 bg-primary/10 border border-primary text-primary rounded text-xs font-mono font-bold flex items-center h-[38px]">
                        API: CONNECTED
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:min-h-[600px] h-auto">
                {/* Main Interactive Map - Takes up 7 columns */}
                <div className="lg:col-span-7 bg-black rounded-xl border border-primary-dim relative overflow-hidden flex flex-col min-h-[400px] lg:min-h-[500px]">
                     <div className="absolute top-4 left-4 z-[400] bg-background-dark/90 backdrop-blur-md border border-primary-dim p-3 rounded-lg shadow-xl space-y-3">
                        <div>
                            <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-2">
                                <Search className="w-4 h-4 text-primary" /> Location Search
                            </h3>
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Enter city or address..."
                                    className="w-40 bg-background-panel border border-primary-dim rounded p-1 text-xs text-white placeholder:text-text-muted" 
                                />
                                <button 
                                    type="submit"
                                    disabled={isSearching}
                                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded px-2 py-1 text-xs font-bold transition-colors"
                                >
                                    {isSearching ? '...' : 'GO'}
                                </button>
                            </form>
                        </div>
                        
                        <div>
                            <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-2">
                                <MapPin className="w-4 h-4 text-primary" /> Coordinates
                            </h3>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    value={coordinates.lat} 
                                    onChange={(e) => setCoordinates(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                                    className="w-24 bg-background-panel border border-primary-dim rounded p-1 text-xs text-white" 
                                    step="0.0001"
                                />
                                <input 
                                    type="number" 
                                    value={coordinates.lng} 
                                    onChange={(e) => setCoordinates(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
                                    className="w-24 bg-background-panel border border-primary-dim rounded p-1 text-xs text-white" 
                                    step="0.0001"
                                />
                            </div>
                        </div>
                     </div>

                     <MapContainer 
                        center={[coordinates.lat, coordinates.lng]} 
                        zoom={18} 
                        style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
                    >
                        {/* Satellite Tiles */}
                        <TileLayer
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                        <MapController 
                            position={coordinates} 
                            setPosition={setCoordinates} 
                            isInteractive={!analyzing}
                        />
                        
                        {/* Heatmap Overlay Simulation */}
                        {result && (
                            <Circle 
                                center={[coordinates.lat, coordinates.lng]}
                                radius={20}
                                pathOptions={{ fillColor: '#FFD700', fillOpacity: 0.3, color: '#FFD700', weight: 1 }}
                            >
                                <Popup>
                                    <div className="text-black text-xs font-bold">
                                        Solar Potential Zone<br/>
                                        Flux: {result.totalSolarFluxKwh.toFixed(0)} kWh/yr
                                    </div>
                                </Popup>
                            </Circle>
                        )}
                    </MapContainer>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400]">
                        <button 
                            onClick={handleAnalysis}
                            disabled={analyzing}
                            className="bg-primary text-background-dark font-bold py-2 px-6 rounded-full shadow-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                        >
                            {analyzing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></div>
                                    CALCULATING FLUX...
                                </>
                            ) : (
                                <>
                                    <Sun className="w-4 h-4" />
                                    ANALYZE TARGET
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Panel - Results & Config - Takes up 5 columns */}
                <div className="lg:col-span-5 space-y-4 flex flex-col lg:h-full h-auto lg:overflow-y-auto pr-2">
                    
                    {/* Financial Calculator Inputs */}
                    <div className="bg-background-panel border border-primary-dim rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Calculator className="w-4 h-4 text-primary" />
                            <h3 className="font-bold text-white text-sm">Financial Parameters</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-text-muted block mb-1">Electricity Rate ($/kWh)</label>
                                <input 
                                    type="number" 
                                    value={electricityRate}
                                    onChange={(e) => setElectricityRate(parseFloat(e.target.value))}
                                    step="0.01"
                                    className="w-full bg-background-dark border border-primary-dim rounded p-2 text-sm text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted block mb-1">Install Cost ($/Panel)</label>
                                <input 
                                    type="number" 
                                    value={panelCost}
                                    onChange={(e) => setPanelCost(parseFloat(e.target.value))}
                                    step="50"
                                    className="w-full bg-background-dark border border-primary-dim rounded p-2 text-sm text-white focus:border-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Results Display */}
                    {result && financials ? (
                        <div className="space-y-4 animate-fade-in">
                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-background-panel border border-primary-dim rounded-xl">
                                    <div className="text-xs text-text-muted mb-1">Annual Production</div>
                                    <div className="text-2xl font-bold text-primary font-mono">
                                        {result.totalSolarFluxKwh.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        <span className="text-xs text-text-muted ml-1">kWh</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-background-panel border border-primary-dim rounded-xl">
                                    <div className="text-xs text-text-muted mb-1">Optimal System</div>
                                    <div className="text-2xl font-bold text-white font-mono">
                                        {result.optimalPanelCount}
                                        <span className="text-xs text-text-muted ml-1">Panels</span>
                                    </div>
                                    <div className="text-xs text-text-muted mt-1">
                                        Area: {result.areaSqM?.toFixed(0)} m²
                                    </div>
                                </div>
                            </div>

                            {/* Financial Projection Card */}
                            <div className="p-5 bg-gradient-to-br from-success/5 to-transparent border border-success/30 rounded-xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <DollarSign className="w-5 h-5 text-success" />
                                    <span className="font-bold text-success">Financial Projection</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-text-muted">Total Investment</span>
                                        <span className="text-white font-mono">${financials.installationCost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-text-muted">Annual Savings</span>
                                        <span className="text-success font-bold font-mono">+${financials.annualSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</span>
                                    </div>
                                    <div className="h-px bg-success/20 my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-white font-bold">ROI Payback Period</span>
                                        <span className="text-xl text-white font-bold font-mono">{financials.paybackPeriod.toFixed(1)} <span className="text-sm font-normal text-text-muted">years</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Flux Chart */}
                            <div className="bg-background-panel border border-primary-dim rounded-xl p-4 h-[250px] flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <BarChart3 className="w-4 h-4 text-primary" />
                                    <h3 className="font-bold text-white text-sm">Daily Irradiance Profile</h3>
                                </div>
                                <div className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="hour" stroke="#666" fontSize={10} tickFormatter={(val) => val.split(':')[0]} />
                                            <YAxis stroke="#666" fontSize={10} />
                                            <RechartsTooltip 
                                                contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                                                itemStyle={{ fontSize: '12px' }}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                                            <Line type="monotone" dataKey="Summer" stroke="#fbbf24" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="Winter" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-primary-dim rounded-xl bg-background-panel/50 text-text-muted p-8 text-center">
                            <Sun className="w-12 h-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-bold text-white mb-2">Ready to Analyze</h3>
                            <p className="text-sm max-w-xs">Select a location on the map and click "Analyze Target" to generate solar potential report.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
