
import { Anomaly, RepairStrategy, TelemetryPoint } from "./types";

const generateMockTelemetry = (): TelemetryPoint[] => {
    const points: TelemetryPoint[] = [];
    const now = new Date();
    
    for (let i = 0; i < 20; i++) {
        const time = new Date(now.getTime() - (20 - i) * 60000);
        points.push({
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            timestamp: time.toISOString(),
            power: 1800 + Math.random() * 500, // kW
            windSpeed: 8 + Math.random() * 4, // m/s
            vibration: 1.5 + Math.random() * (i > 15 ? 4 : 1), // mm/s
            rotorSpeed: 12 + Math.random() * 2, // RPM
            temperature: 60 + Math.random() * 10, // C
            pitchAngle: 4 + Math.random() * 2 // deg
        });
    }
    return points;
};

export const MOCK_TELEMETRY: TelemetryPoint[] = generateMockTelemetry();

export const MOCK_ANOMALIES: Anomaly[] = [
    {
        id: "ANM-2024-884",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        type: "VibrationSpike",
        severity: "CRITICAL",
        confidence: 0.98,
        description: "Nacelle vibration exceeding 8.5mm/s threshold on Axis-Y.",
        assetId: "WTG-04",
        status: "OPEN",
        recommendedAction: "Immediate shutdown and inspection"
    },
    {
        id: "ANM-2024-881",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        type: "LeadingEdgeErosion",
        severity: "MEDIUM",
        confidence: 0.89,
        description: "Leading edge erosion detected on Blade B (Zone 4).",
        assetId: "WTG-04",
        status: "INVESTIGATING",
        recommendedAction: "Schedule repair within 30 days"
    },
    {
        id: "ANM-2024-875",
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        type: "ThermalHotspot",
        severity: "LOW",
        confidence: 0.76,
        description: "Minor thermal hotspot detected on solar array inverter connection.",
        assetId: "SOL-12",
        status: "RESOLVED",
        recommendedAction: "Monitor for recurrence"
    }
];

export const REPAIR_STRATEGIES: RepairStrategy[] = [
    {
        tier: 'Budget',
        name: 'Patch Repair',
        cost: 4500,
        downtime: 6,
        lifeExtension: 0.5,
        riskLevel: 'High',
        description: 'Minimal intervention. Addresses symptoms but not root cause.',
        recommended: false,
        warranty: '90 days'
    },
    {
        tier: 'Balanced',
        name: 'Sub-assembly Swap',
        cost: 12000,
        downtime: 12,
        lifeExtension: 3.0,
        riskLevel: 'Low',
        description: 'Replace bearing race and seals. Optimal balance of cost vs longevity.',
        recommended: true,
        warranty: '2 years'
    },
    {
        tier: 'Luxury',
        name: 'Full Overhaul',
        cost: 45000,
        downtime: 48,
        lifeExtension: 10.0,
        riskLevel: 'Zero',
        description: 'Complete Gen-5 yaw system installation with upgraded sensors.',
        recommended: false,
        warranty: '5 years'
    }
];

export const COLORS = {
    primary: '#06f9f9',
    alert: '#fa5c38',
    success: '#0bda50',
    grid: '#2f6a6a',
    bg: '#0f2323'
};
