import { GoogleGenAI } from "@google/genai";
import { Anomaly, TelemetryPoint } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Defined in Technical Specification: Page 5
const MISSION_CONTROL_INSTRUCTION = `
Role: AetherGrid Mission Control Orchestrator
Goal: Analyze multimodal data streams to identify structural/electrical anomalies
Operational Protocol:
1. Perception: Process drone video (media_resolution: high)
2. Reasoning: Cross-reference with SCADA JSON logs
3. Planning: Root-cause analysis (thinking_level: high)
4. Action: Tool calling with Thought Signature context preservation
`;

export const generateRootCauseAnalysis = async (anomaly: Anomaly, recentTelemetry: TelemetryPoint[]) => {
    try {
        const telemetryContext = JSON.stringify(recentTelemetry.slice(-10));
        
        const prompt = `
        Analyze the following anomaly detected in a wind turbine asset.
        
        Anomaly: ${JSON.stringify(anomaly)}
        Recent SCADA Telemetry: ${telemetryContext}
        
        Provide a concise "Predictive Root-Cause Analysis". 
        Distinguish between environmental noise and genuine component fatigue.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Specification: Page 16
            contents: prompt,
            config: {
                systemInstruction: MISSION_CONTROL_INSTRUCTION,
                temperature: 0.2, // Low temperature for factual analysis
                thinkingConfig: { thinkingBudget: 1024 }, // "thinking_level: high" equivalent
            }
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "AI Analysis Unavailable: Orchestrator connection failed.";
    }
};

export const generateStrategyJustification = async (tier: string, cost: number, lifeExt: number) => {
    try {
        const prompt = `
        You are the Planning Agent (Antigravity Platform).
        Justify the selection of the "${tier}" repair tier (Cost: $${cost}, Life Extension: +${lifeExt} yrs).
        Explain the ROI and risk trade-off.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                temperature: 0.5,
                thinkingConfig: { thinkingBudget: 512 } 
            }
        });

        return response.text;
    } catch (error) {
        return "Strategy data unavailable.";
    }
};

export const optimizeSolarLayout = async (lat: number, lng: number) => {
    try {
        const prompt = `
        Analyze rooftop solar potential for coordinates ${lat}, ${lng}.
        Simulate "query_solar_potential" tool output.
        Return a JSON object with: total_solar_flux_kwh, optimal_panel_count, shade_loss_percentage, annual_savings.
        `;
        
        // In a real app, this would use the Google Maps Solar API tool
        // Here we simulate the reasoning for the UI
        return {
            fluxKwh: 14500,
            areaSqM: 450,
            panelCount: 32,
            annualSavings: 4200,
            paybackPeriod: 4.5,
            shadeLoss: 12
        };
    } catch (error) {
        return null;
    }
};