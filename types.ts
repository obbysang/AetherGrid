export interface TelemetryPoint {
    time: string;
    power: number; // MW
    windSpeed: number; // m/s
    vibration: number; // mm/s
    rotorSpeed: number; // RPM
    temperature: number; // Celsius
}

export interface Anomaly {
    id: string;
    timestamp: string;
    type: 'EROSION' | 'THERMAL' | 'STRUCTURAL' | 'VIBRATION';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    description: string;
    assetId: string;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}

export interface RepairStrategy {
    tier: 'Budget' | 'Balanced' | 'Luxury';
    name: string;
    cost: number;
    downtime: number; // hours
    lifeExtension: number; // years
    riskLevel: 'High' | 'Low' | 'Zero';
    description: string;
    recommended: boolean;
}

export interface WorkOrder {
    id: string;
    title: string;
    assetId: string;
    status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    assignedCrew?: string;
    scheduledDate?: string;
    estimatedDuration: number; // hours
    partsRequired: string[];
}

export interface SolarPotential {
    fluxKwh: number;
    areaSqM: number;
    panelCount: number;
    annualSavings: number;
    paybackPeriod: number; // years
    shadeLoss: number; // percentage
}

export enum View {
    MISSION_CONTROL = 'MISSION_CONTROL',
    PERCEPTION_LAB = 'PERCEPTION_LAB',
    SCADA_ANALYTICS = 'SCADA_ANALYTICS',
    SITE_SUPERVISOR = 'SITE_SUPERVISOR',
    LOGISTICS = 'LOGISTICS',
    SOLAR_PLANNER = 'SOLAR_PLANNER',
    CONFIGURATION = 'CONFIGURATION',
}