
import { GoogleGenAI, Type as SchemaType, FunctionDeclaration, Content, Part } from "@google/genai";
import { Anomaly, TelemetryPoint, WorkOrder, SolarPotential, RepairPart } from "../types";
import { scadaService } from "./scadaService";
import { logisticsService } from "./logisticsService";
import { solarService } from "./solarService";

// Environment Check
const getApiKey = () => {
    // Check Vite env vars first, then localStorage (for local dev fallback)
    return import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('gemini_api_key') || '';
};

// --- Tool Definitions for Gemini (aligned with PDF Spec) ---
const tools: FunctionDeclaration[] = [
    {
        name: "analyze_scada_telemetry",
        description: "Analyze SCADA sensor data for anomalies over a specified time window. Returns anomaly details including type, severity, and raw sensor data context.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                window_seconds: { type: SchemaType.INTEGER, description: "Time window in seconds to analyze (default 60)" }
            }
        }
    },
    {
        name: "dispatch_repair_crew",
        description: "Create a work order to dispatch a repair crew. Checks inventory and schedules based on priority.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                fault_type: { type: SchemaType.STRING, description: "Type of defect (e.g., LeadingEdgeErosion)" },
                priority_level: { type: SchemaType.INTEGER, description: "1 (Critical) to 5 (Routine)" },
                asset_id: { type: SchemaType.STRING, description: "Asset ID (e.g., WTG-042)" },
                crew_size: { type: SchemaType.INTEGER, description: "Required crew size" },
                estimated_hours: { type: SchemaType.NUMBER, description: "Estimated labor hours" },
                estimated_parts_list: {
                    type: SchemaType.ARRAY,
                    description: "List of parts required",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            partId: { type: SchemaType.STRING },
                            quantity: { type: SchemaType.INTEGER },
                            unitCost: { type: SchemaType.NUMBER },
                            name: { type: SchemaType.STRING }
                        }
                    }
                }
            },
            required: ["fault_type", "priority_level", "asset_id"]
        }
    },
    {
        name: "query_solar_potential",
        description: "Analyze solar potential for a specific location using rooftop geometry and solar flux data.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                lat: { type: SchemaType.NUMBER },
                lng: { type: SchemaType.NUMBER },
                panel_type: { type: SchemaType.STRING, description: "Monocrystalline or Polycrystalline" }
            },
            required: ["lat", "lng"]
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
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
        return result as {title: string, description: string, type: 'CRITICAL' | 'NORMAL'};
    }
}

// --- Main Service ---

export const analyzeVisualAnomaly = async (imageBase64: string) => {
    const apiKey = getApiKey();
    if (!apiKey) return AI_Simulator.analyzeVisualSnapshot(imageBase64);

    try {
        const ai = new GoogleGenAI({ apiKey });
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        // Upgrade to Gemini 3 Pro Preview for Multimodal Reasoning
        // const model = 'gemini-2.0-flash'; // Fallback to flash for speed if needed, but aim for 3
        const model = 'gemini-3-pro-preview'; 
        
        const prompt = `
        Analyze this image from a drone inspection of a wind turbine or industrial asset.
        Identify any anomalies such as cracks, erosion, surface contamination, or structural issues.
        
        Return a JSON object with the following structure:
        {
            "title": "Short Title of Issue",
            "description": "Concise description of the finding (max 2 sentences)",
            "type": "CRITICAL" | "NORMAL"
        }
        
        If no significant anomalies are found, return type "NORMAL" with a routine check description.
        Ensure the output is valid JSON. Do not include markdown code blocks.
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: cleanBase64
                            }
                        }
                    ]
                }
            ]
        });

        const responseText = response.text || "{}";
        // clean up markdown if present
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Gemini Vision Error:", error);
        return AI_Simulator.analyzeVisualSnapshot(imageBase64);
    }
};

export const generateRootCauseAnalysis = async (anomaly: Anomaly, recentTelemetry: TelemetryPoint[]) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return AI_Simulator.generateRootCause(anomaly, recentTelemetry);
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
            contents: [
                { parts: [{ text: prompt }] }
            ],
            config: {
                systemInstruction: `Role: AetherGrid Mission Control. Goal: Analyze anomalies.`,
                temperature: 0.2,
                // thinkingConfig: { thinkingBudget: 1024 }, // Enable if supported by account/model
            }
        });

        return response.text || "Analysis failed.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return AI_Simulator.generateRootCause(anomaly, recentTelemetry);
    }
};

export const generateStrategyJustification = async (tier: string, cost: number, lifeExt: number) => {
    const apiKey = getApiKey();
    if (!apiKey) return AI_Simulator.justifyStrategy(tier);

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
        Justify the selection of the "${tier}" repair tier (Cost: $${cost}, Life Extension: +${lifeExt} yrs).
        Explain the ROI and risk trade-off.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [
                 { parts: [{ text: prompt }] }
            ],
            config: { temperature: 0.5 }
        });

        return response.text || "Justification unavailable.";
    } catch (error) {
        return AI_Simulator.justifyStrategy(tier);
    }
};

// --- Mission Control Agent Loop (ReAct Implementation) ---

interface AgentStep {
    step: number;
    thought: string;
    action?: string;
    result?: any;
}

export const runMissionControlAgent = async (trigger: string, context: any): Promise<{status: string, steps: AgentStep[], finalResult: any}> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        // Fallback to "Happy Path" simulation if no key
        return runSimulationWorkflow(trigger);
    }

    console.log("Starting Mission Control Agent:", trigger);
    const steps: AgentStep[] = [];
    const ai = new GoogleGenAI({ apiKey });
    
    // Initial System Prompt
    const systemInstruction = `
    Role: AetherGrid Mission Control Orchestrator.
    Goal: Autonomous maintenance of renewable energy assets.
    
    You have access to the following tools:
    1. analyze_scada_telemetry(window_seconds: int) - Check sensor data.
    2. dispatch_repair_crew(fault_type, priority_level, asset_id, crew_size, estimated_hours, estimated_parts_list) - Create work orders.
    3. query_solar_potential(lat, lng, panel_type) - Analyze solar capacity.

    Protocol:
    - When an anomaly is reported, ALWAYS verify it with 'analyze_scada_telemetry' first.
    - If verified, determine severity and dispatch a crew using 'dispatch_repair_crew'.
    - Use 'query_solar_potential' only for solar planning tasks.
    - Output a "Thought" before every action to explain your reasoning.
    - Maintain a "Thought Signature" style of continuity.
    `;

    // Initialize history with proper typing if possible, but for now we rely on inferred 'any' structure 
    // or we construct it strictly according to SDK types.
    let history: Content[] = [
        { role: 'user', parts: [{ text: `Trigger Event: ${trigger}. Context: ${JSON.stringify(context)}` }] }
    ];

    let finalResult = null;
    const maxTurns = 5;

    for (let i = 0; i < maxTurns; i++) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: history,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.1, // Low temp for reliable tool calling
                    tools: [{ functionDeclarations: tools }],
                }
            });

            // In @google/genai, the response object itself usually contains candidates.
            // Adjusting based on standard usage patterns for this SDK version.
            const candidates = response.candidates; 
            const parts = candidates?.[0]?.content?.parts || [];
            
            // Add model response to history
            history.push({ role: 'model', parts: parts });

            let textResponse = "";
            let functionCall = null;

            for (const part of parts) {
                if (part.text) {
                    textResponse += part.text;
                }
                if (part.functionCall) {
                    functionCall = part.functionCall;
                }
            }

            steps.push({
                step: i + 1,
                thought: textResponse,
                action: functionCall ? functionCall.name : "Final Answer"
            });

            if (functionCall) {
                console.log(`Agent executing tool: ${functionCall.name}`, functionCall.args);
                
                // Execute Tool
                let toolResult;
                const args = functionCall.args as any;

                if (functionCall.name === 'analyze_scada_telemetry') {
                    toolResult = await scadaService.analyzeTelemetry(args.window_seconds || 60);
                } else if (functionCall.name === 'dispatch_repair_crew') {
                    toolResult = await logisticsService.dispatchRepairCrew(
                        args.fault_type,
                        args.priority_level,
                        args.asset_id,
                        args.estimated_parts_list || [],
                        args.crew_size || 2,
                        args.estimated_hours || 4
                    );
                    toolResult = { work_order_id: toolResult, status: "DISPATCHED" };
                } else if (functionCall.name === 'query_solar_potential') {
                    toolResult = await solarService.analyzeRoof(args.lat, args.lng, args.panel_type);
                    // Compress result for context window
                    if (toolResult.hourlyFluxMap) toolResult.hourlyFluxMap = []; 
                } else {
                    toolResult = { error: "Unknown tool" };
                }

                // Add tool result to history
                // Note: role needs to be 'function' or 'tool' depending on the exact SDK version nuances.
                // Assuming 'function' for now as it's common for 'functionCall' handling.
                history.push({
                    role: 'function',
                    parts: [{
                        functionResponse: {
                            name: functionCall.name,
                            response: { result: toolResult }
                        }
                    }]
                });
                
                // Update step with result
                steps[steps.length - 1].result = toolResult;

            } else {
                // No function call means we are done
                finalResult = textResponse;
                break;
            }

        } catch (e) {
            console.error("Agent Loop Error:", e);
            steps.push({ step: i + 1, thought: "Error in agent loop", result: e });
            break;
        }
    }

    return {
        status: "COMPLETED",
        steps,
        finalResult
    };
};

// Simulation fallback for when no API key is present
const runSimulationWorkflow = async (trigger: string) => {
    console.log("Running Simulation Workflow (No API Key)");
    await new Promise(r => setTimeout(r, 1000));
    
    // Step 1: Analyze
    const scadaResult = await scadaService.analyzeTelemetry(60);
    
    // Step 2: Simulated Logic
    // Explicitly typing the steps array to allow flexible result types
    let steps: AgentStep[] = [
        { step: 1, thought: "Analyzing SCADA telemetry for correlations...", action: "analyze_scada_telemetry", result: scadaResult }
    ];

    if (scadaResult.anomalyDetected) {
         // Step 3: Dispatch
         const woId = await logisticsService.dispatchRepairCrew(
             "VibrationSpike",
             1,
             "WTG-042",
             [{ partId: "P-BEARING", quantity: 1, unitCost: 500 }],
             3,
             6
         );
         steps.push({ 
             step: 2, 
             thought: "Anomaly confirmed. Vibration levels critical. Dispatching repair crew.", 
             action: "dispatch_repair_crew", 
             result: { work_order_id: woId, status: "DISPATCHED" } 
        });
    } else {
        steps.push({ step: 2, thought: "No SCADA anomalies correlated. Marking as false positive.", action: "None" });
    }

    return {
        status: "SIMULATED",
        steps,
        finalResult: "Workflow complete."
    };
}

export const executeSolarPlanning = async (lat: number, lng: number, areaSqM?: number) => {
    // Direct tool call wrapper
    return solarService.analyzeRoof(lat, lng, 'Monocrystalline', areaSqM);
};
