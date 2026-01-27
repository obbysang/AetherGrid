import { Anomaly, RepairStrategy, TelemetryPoint } from "./types";

export const MOCK_TELEMETRY: TelemetryPoint[] = Array.from({ length: 20 }, (_, i) => ({
    time: `10:${30 + i}:00`,
    power: 2.0 + Math.random() * 0.5,
    windSpeed: 10 + Math.random() * 5,
    vibration: 2.0 + Math.random() * (i > 15 ? 4 : 1), // Spike at end
    rotorSpeed: 14 + Math.random() * 0.5,
    temperature: 45 + Math.random() * 5
}));

export const MOCK_ANOMALIES: Anomaly[] = [
    {
        id: "ANM-2024-884",
        timestamp: "10:48:12",
        type: "VIBRATION",
        severity: "CRITICAL",
        confidence: 0.98,
        description: "Nacelle vibration exceeding 8.5mm/s threshold on Axis-Y.",
        assetId: "WTG-04",
        status: "OPEN"
    },
    {
        id: "ANM-2024-881",
        timestamp: "10:15:00",
        type: "EROSION",
        severity: "MEDIUM",
        confidence: 0.89,
        description: "Leading edge erosion detected on Blade B (Zone 4).",
        assetId: "WTG-04",
        status: "INVESTIGATING"
    },
    {
        id: "ANM-2024-875",
        timestamp: "09:30:00",
        type: "THERMAL",
        severity: "LOW",
        confidence: 0.76,
        description: "Minor thermal hotspot detected on solar array inverter connection.",
        assetId: "SOL-12",
        status: "RESOLVED"
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
        recommended: false
    },
    {
        tier: 'Balanced',
        name: 'Sub-assembly Swap',
        cost: 12000,
        downtime: 12,
        lifeExtension: 3.0,
        riskLevel: 'Low',
        description: 'Replace bearing race and seals. Optimal balance of cost vs longevity.',
        recommended: true
    },
    {
        tier: 'Luxury',
        name: 'Full Overhaul',
        cost: 45000,
        downtime: 48,
        lifeExtension: 10.0,
        riskLevel: 'Zero',
        description: 'Complete Gen-5 yaw system installation with upgraded sensors.',
        recommended: false
    }
];

export const COLORS = {
    primary: '#06f9f9',
    alert: '#fa5c38',
    success: '#0bda50',
    grid: '#2f6a6a',
    bg: '#0f2323'
};