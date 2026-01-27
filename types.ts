
export interface TelemetryPoint {
    time: string; // HH:mm:ss for display, ISO for storage
    timestamp: string; // ISO8601
    power: number; // power_output_kw (MW in some views, kW in spec) - let's standardize on kW internally and convert for display
    windSpeed: number; // wind_speed_ms
    vibration: number; // nacelle_vibration (mm/s)
    rotorSpeed: number; // rotor_rpm
    temperature: number; // temperature_c
    pitchAngle: number; // blade_pitch_angle
}

export interface Anomaly {
    id: string;
    timestamp: string;
    type: 'LeadingEdgeErosion' | 'Delamination' | 'ThermalHotspot' | 'PitchBearing' | 'PowerCurveDrop' | 'VibrationSpike' | 'TemperatureAnomaly' | 'PitchMalfunction' | 'VIBRATION' | 'EROSION' | 'THERMAL' | 'STRUCTURAL'; // Merging spec types with existing
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    confidence: number;
    description: string;
    assetId: string;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
    recommendedAction?: string;
    correlationConfidence?: number;
}

export interface RepairPart {
    partId: string;
    quantity: number;
    unitCost: number;
    name?: string; // Helper for UI
}

export interface DateRange {
    startDate: string;
    endDate: string;
}

export interface WorkOrder {
    id: string; // work_order_id
    title: string;
    assetId: string;
    status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; // priority_level mapped
    assignedCrew?: string;
    scheduledDate?: string;
    estimatedDuration: number; // estimated_hours
    partsRequired: RepairPart[]; // estimated_parts_list
    crewSize?: number;
    faultType?: string;
    calendarEventId?: string;
}

export interface SolarPotential {
    totalSolarFluxKwh: number;
    hourlyFluxMap: number[]; // 8760 elements
    optimalPanelCount: number;
    shadeLossPercentage: number;
    financialProjections: {
        installationCost: number;
        annualSavings: number;
        paybackPeriod: number;
    };
    areaSqM?: number; // Helper
}

export interface RepairStrategy {
    tier: 'Budget' | 'Balanced' | 'Luxury';
    name?: string;
    cost: number;
    downtime: number; // hours
    lifeExtension: number; // years
    riskLevel?: 'High' | 'Low' | 'Zero';
    description?: string;
    recommended: boolean;
    partsIncluded?: string[];
    warranty?: string;
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
