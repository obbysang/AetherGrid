
import { GoogleGenAI } from "@google/genai";
import { Anomaly, TelemetryPoint, WorkOrder, SolarPotential } from "../types";
import { scadaService } from "./scadaService";
import { logisticsService } from "./logisticsService";
import { solarService } from "./solarService";

// Environment Check
const getApiKey = () => {
    // Check process.env first, then localStorage (for local dev fallback)
    return process.env.API_KEY || localStorage.getItem('gemini_api_key') || '';
};

// --- Tool Definitions for Gemini ---
const tools = [
    {
        name: "analyze_scada_telemetry",
        description: "Analyze SCADA sensor data for anomalies.",
        parameters: {
            type: "OBJECT",
            properties: {
                window_seconds: { type: "INTEGER", description: "Time window in seconds to analyze" }
            }
        }
    },
    {
        name: "dispatch_repair_crew",
        description: "Create a work order to dispatch a repair crew.",
        parameters: {
            type: "OBJECT",
            properties: {
                fault_type: { type: "STRING" },
                priority_level: { type: "INTEGER" },
                asset_id: { type: "STRING" },
                crew_size: { type: "INTEGER" },
                estimated_hours: { type: "NUMBER" }
            }
        }
    },
    {
        name: "query_solar_potential",
        description: "Analyze solar potential for a location.",
        parameters: {
            type: "OBJECT",
            properties: {
                lat: { type: "NUMBER" },
                lng: { type: "NUMBER" }
            }
        }
    }
];

// --- Fallback / Simulation Logic (When API Key is missing) ---
class AI_Simulator {
    static async generateRootCause(anomaly: Anomaly, telemetry: TelemetryPoint[]): Promise<string> {
        await new Promise(r => setTimeout(r, 1500)); // Thinking time
        
        if (anomaly.type.includes('VIBRATION') || anomaly.type === 'VibrationSpike') {
            const vib = telemetry[telemetry.length-1]?.vibration.toFixed(2) || "Unknown";
            return `**Analysis**: High vibration detected (${vib} mm/s). \n**Root Cause**: Potential misalignment in the high-speed shaft coupling. \n**Recommendation**: Inspect coupling and gearbox mounts.`;
        }
        if (anomaly.type.includes('EROSION')) {
            return `**Analysis**: Visual evidence of leading edge erosion. \n**Root Cause**: Environmental wear from particulate impact. \n**Recommendation**: Schedule blade repair (Tier 2).`;
        }
        return `**Analysis**: Anomaly detected in ${anomaly.assetId}. \n**Root Cause**: Pattern matches historical sensor drift. \n**Recommendation**: Calibrate sensors and monitor.`;
    }

    static async justifyStrategy(tier: string): Promise<string> {
        await new Promise(r => setTimeout(r, 1000));
        if (tier === 'Budget') return "Selected for short-term cost containment. Risks recurrence within 6 months.";
        if (tier === 'Balanced') return "Optimal ROI. Extends asset life by 3 years with moderate initial outlay.";
        return "Maximum longevity. Includes 5-year warranty and complete subsystem overhaul.";
    }

    static async analyzeVisualSnapshot(imageBase64: string): Promise<{title: string, description: string, type: 'CRITICAL' | 'NORMAL'}> {
        await new Promise(r => setTimeout(r, 2000)); // Sim processing
        const outcomes = [
            { title: "Leading Edge Erosion", description: "Significant wear detected on blade tip. Risk of aerodynamic loss.", type: 'CRITICAL' },
            { title: "Surface Contamination", description: "Oil/dirt accumulation. Non-critical.", type: 'NORMAL' },
            { title: "Micro-Crack", description: "Hairline fracture detected near root. Monitor closely.", type: 'CRITICAL' },
            { title: "Lightning Strike", description: "Charring pattern consistent with lightning impact.", type: 'CRITICAL' }
        ];
        return outcomes[Math.floor(Math.random() * outcomes.length)] as any;
    }
}

// --- Main Service ---

export const analyzeVisualAnomaly = async (imageBase64: string) => {
    // In a real scenario, we would send the image to Gemini 1.5 Pro/Flash for analysis
    // For this demo, we'll use the simulator to ensure responsiveness without requiring an active API key for vision tasks
    return AI_Simulator.analyzeVisualSnapshot(imageBase64);
};

export const generateRootCauseAnalysis = async (anomaly: Anomaly, recentTelemetry: TelemetryPoint[]) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("MISSING_API_KEY");
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const telemetryContext = JSON.stringify(recentTelemetry.slice(-10));
        
        const prompt = `
        Analyze the following anomaly detected in a wind turbine asset.
        
        Anomaly: ${JSON.stringify(anomaly)}
        Recent SCADA Telemetry: ${telemetryContext}
        
        Provide a concise "Predictive Root-Cause Analysis". 
        Distinguish between environmental noise and genuine component fatigue.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', 
            contents: prompt,
            config: {
                systemInstruction: `Role: AetherGrid Mission Control. Goal: Analyze anomalies.`,
                temperature: 0.2,
                thinkingConfig: { thinkingBudget: 1024 }, 
            }
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return AI_Simulator.generateRootCause(anomaly, recentTelemetry);
    }
};

export const generateStrategyJustification = async (tier: string, cost: number, lifeExt: number) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("MISSING_API_KEY");

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
        Justify the selection of the "${tier}" repair tier (Cost: $${cost}, Life Extension: +${lifeExt} yrs).
        Explain the ROI and risk trade-off.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { temperature: 0.5 }
        });

        return response.text;
    } catch (error) {
        return AI_Simulator.justifyStrategy(tier);
    }
};

// Tool-enabled Agent Workflow (Antigravity Platform Simulation)
export const runMaintenanceWorkflow = async (trigger: string, context: any) => {
    console.log("Starting Maintenance Workflow:", trigger);
    
    // In a full implementation with API Key, this would be a multi-turn loop
    // calling tools. Here we implement the "Happy Path" logic directly 
    // to ensure functionality even without the LLM, while keeping the structure ready.
    
    // Step 1: Analyze SCADA (Analytics Agent)
    const scadaResult = await scadaService.analyzeTelemetry(60);
    
    if (scadaResult.anomalyDetected) {
        console.log("Workflow: Anomaly Confirmed", scadaResult.anomalies[0]);
        
        // Step 2: Plan Repair (Planning Agent)
        // (Logic handled in UI via Strategy Selection)
        
        // Step 3: Logistics (Logistics Agent)
        // This is usually triggered by user approval in the UI
    }
    
    return {
        status: "ANALYZED",
        findings: scadaResult
    };
};

export const executeSolarPlanning = async (lat: number, lng: number) => {
    // Direct tool call wrapper
    return solarService.analyzeRoof(lat, lng);
};
