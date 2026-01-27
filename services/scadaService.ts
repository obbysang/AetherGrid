
import { TelemetryPoint, Anomaly } from "../types";

// Simulation Constants
const UPDATE_INTERVAL_MS = 2000;
const HISTORY_LENGTH = 100;
const STORAGE_KEY = 'aether_scada_history';

class ScadaService {
    private history: TelemetryPoint[] = [];
    private listeners: ((point: TelemetryPoint, history: TelemetryPoint[]) => void)[] = [];
    private intervalId: NodeJS.Timeout | null = null;

    constructor() {
        this.loadHistory();
        this.startSimulation();
    }

    private loadHistory() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                this.history = JSON.parse(stored);
                // Prune old history if needed
                if (this.history.length > HISTORY_LENGTH) {
                    this.history = this.history.slice(-HISTORY_LENGTH);
                }
            } catch (e) {
                console.error("Failed to load SCADA history", e);
                this.history = this.generateInitialHistory();
            }
        } else {
            this.history = this.generateInitialHistory();
        }
    }

    private generateInitialHistory(): TelemetryPoint[] {
        const points: TelemetryPoint[] = [];
        const now = Date.now();
        for (let i = HISTORY_LENGTH; i > 0; i--) {
            points.push(this.generatePoint(now - i * UPDATE_INTERVAL_MS));
        }
        return points;
    }

    private generatePoint(timestamp: number): TelemetryPoint {
        // Use sine waves + noise for realistic data
        const t = timestamp / 10000; // Time factor
        const noise = () => Math.random() * 0.1 - 0.05;
        
        const windSpeed = 8 + Math.sin(t * 0.5) * 4 + noise() * 5; // 4-12 m/s base
        const powerCurve = Math.max(0, Math.pow(Math.max(0, windSpeed - 3), 3) / 100); // Rough power curve
        const power = Math.min(5000, powerCurve * 1000 + noise() * 50); // kW
        
        return {
            time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            timestamp: new Date(timestamp).toISOString(),
            windSpeed: Math.max(0, windSpeed),
            power: Math.max(0, power),
            vibration: 1.0 + Math.max(0, (windSpeed - 10) * 0.2) + Math.random() * 0.5,
            rotorSpeed: Math.min(25, Math.max(0, windSpeed * 1.5)),
            temperature: 50 + Math.sin(t * 0.1) * 10 + power / 200,
            pitchAngle: Math.max(0, Math.min(90, (windSpeed > 12 ? (windSpeed - 12) * 5 : 0) + noise() * 2))
        };
    }

    private startSimulation() {
        if (this.intervalId) return;
        
        this.intervalId = setInterval(() => {
            const point = this.generatePoint(Date.now());
            this.history.push(point);
            if (this.history.length > HISTORY_LENGTH) {
                this.history.shift();
            }
            this.notifyListeners(point);
            this.saveHistory();
        }, UPDATE_INTERVAL_MS);
    }

    private saveHistory() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
    }

    private notifyListeners(point: TelemetryPoint) {
        this.listeners.forEach(cb => cb(point, this.history));
    }

    public subscribe(callback: (point: TelemetryPoint, history: TelemetryPoint[]) => void): () => void {
        this.listeners.push(callback);
        // Immediate callback with current state
        if (this.history.length > 0) {
            callback(this.history[this.history.length - 1], this.history);
        }
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    public getLatest(): TelemetryPoint | null {
        return this.history.length > 0 ? this.history[this.history.length - 1] : null;
    }

    public getHistory(): TelemetryPoint[] {
        return [...this.history];
    }

    // Tool Function Implementation
    public async analyzeTelemetry(windowSeconds: number = 60): Promise<{
        anomalyDetected: boolean;
        anomalies: Anomaly[];
    }> {
        // Analyze the last N seconds of data
        const cutoff = Date.now() - windowSeconds * 1000;
        const windowData = this.history.filter(p => new Date(p.timestamp).getTime() > cutoff);
        
        const anomalies: Anomaly[] = [];
        
        if (windowData.length === 0) return { anomalyDetected: false, anomalies: [] };

        // Simple Rule-Based Detection (Simulation of AI Analysis)
        const avgVibration = windowData.reduce((sum, p) => sum + p.vibration, 0) / windowData.length;
        const avgTemp = windowData.reduce((sum, p) => sum + p.temperature, 0) / windowData.length;
        const lastPoint = windowData[windowData.length - 1];

        if (avgVibration > 4.0) {
            anomalies.push({
                id: `ANM-${Date.now()}-VIB`,
                timestamp: lastPoint.timestamp,
                type: 'VibrationSpike',
                severity: avgVibration > 6 ? 'CRITICAL' : 'HIGH',
                confidence: 0.95,
                description: `Sustained vibration (${avgVibration.toFixed(2)} mm/s) detected.`,
                assetId: 'WTG-04', // Hardcoded for this demo scope
                status: 'OPEN',
                recommendedAction: 'Inspect nacelle bearings immediately.'
            });
        }

        if (avgTemp > 85) {
            anomalies.push({
                id: `ANM-${Date.now()}-TMP`,
                timestamp: lastPoint.timestamp,
                type: 'TemperatureAnomaly',
                severity: 'MEDIUM',
                confidence: 0.88,
                description: `Generator temperature high (${avgTemp.toFixed(1)}°C).`,
                assetId: 'WTG-04',
                status: 'OPEN',
                recommendedAction: 'Check cooling system.'
            });
        }

        return {
            anomalyDetected: anomalies.length > 0,
            anomalies
        };
    }
}

export const scadaService = new ScadaService();
