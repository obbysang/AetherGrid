
import { SolarPotential } from "../types";

// Constants for simulation
const BASE_FLUX_KWH = 1400; // kWh/m2/year average
const PANEL_EFFICIENCY = 0.21;
const PANEL_AREA = 1.6; // m2
const KW_PRICE = 0.15; // $/kWh

class SolarService {
    
    // Tool Function: query_solar_potential
    public async analyzeRoof(
        lat: number, 
        lng: number, 
        panelType: string = 'Monocrystalline'
    ): Promise<SolarPotential> {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 1. Calculate Solar Flux based on Latitude
        // Closer to equator (0) = higher flux. 
        // Simple model: 1 - (abs(lat) / 90) * 0.5
        const latFactor = 1 - (Math.abs(lat) / 90) * 0.6;
        const localFluxBase = BASE_FLUX_KWH * latFactor;
        
        // Add some noise based on "Longitude" (simulating local weather patterns)
        const weatherFactor = 1 + (Math.sin(lng) * 0.1); 
        const annualFluxPerSqM = localFluxBase * weatherFactor;

        // 2. Simulate Roof Geometry (Randomized deterministic based on coords)
        const roofSeed = Math.abs(lat * lng * 1000);
        const roofArea = 100 + (roofSeed % 400); // 100-500 m2
        const usableArea = roofArea * 0.7; // 70% usable

        // 3. Shade Analysis
        const shadeLoss = 5 + (roofSeed % 20); // 5-25% shade loss

        // 4. Panel Calculation
        const optimalPanelCount = Math.floor(usableArea / PANEL_AREA);
        const effectiveFlux = annualFluxPerSqM * (1 - shadeLoss / 100);
        
        // Total System Output
        // kWh = Panels * Area * Efficiency * Flux * PerformanceRatio(0.75)
        const totalSolarFluxKwh = optimalPanelCount * PANEL_AREA * PANEL_EFFICIENCY * effectiveFlux * 0.75;

        // 5. Financials
        const installationCost = optimalPanelCount * 800; // $800 per panel installed
        const annualSavings = totalSolarFluxKwh * KW_PRICE;
        const paybackPeriod = installationCost / annualSavings;

        // 6. Generate Hourly Flux Map (8760 points) - compressed for demo
        // We'll generate a representative daily curve for each month (12 * 24 = 288 points) 
        // and expand or just return empty if the UI doesn't need all 8760
        // Spec says 8760-element array. Let's generate a simplified version.
        const hourlyFluxMap = new Array(8760).fill(0).map((_, i) => {
            const hour = i % 24;
            const day = Math.floor(i / 24);
            // Day/Night cycle
            if (hour < 6 || hour > 18) return 0;
            // Seasonality (sine wave over 365 days)
            const season = Math.sin((day / 365) * Math.PI * 2); 
            // Daily curve (parabola)
            const daily = Math.sin(((hour - 6) / 12) * Math.PI);
            return Math.max(0, daily * (1 + season * 0.2));
        });

        return {
            totalSolarFluxKwh,
            hourlyFluxMap, // This is huge, might slow down serialization, but spec requires it.
            optimalPanelCount,
            shadeLossPercentage: shadeLoss,
            financialProjections: {
                installationCost,
                annualSavings,
                paybackPeriod
            },
            areaSqM: roofArea
        };
    }
}

export const solarService = new SolarService();
