import { useCallback, useEffect, useState } from 'react';
import { useBLEContext } from '../context/BLEContext';

export interface SensorData {
  heartRate: number | null;    // BPM
  temperature: number | null;  // °F
  spo2: number | null;        // %
  respRate: number | null;    // breaths/min
  steps: number;              // count
  batteryLife: number | null; // %
}

const initialData: SensorData = {
  heartRate: null,
  temperature: null,
  spo2: null,
  respRate: null,
  steps: 0,
  batteryLife: null
};

/**
 * Parses a UART message from the device.
 * Now expects comma-separated float values: heartRate, respRate, spo2, steps, batteryLife
 */
function parseMessage(msg: string): Partial<SensorData> {
  if (!msg || msg.trim().length === 0) return {};
  const trimmed = msg.trim();
  console.log('parseMessage: raw lastMessage:', JSON.stringify(trimmed));
  // Try comma-separated float values first
  const values = trimmed.split(',').map(v => v.trim()).filter(v => v.length > 0);
  if (values.length >= 5) {
    const [hr, brpm, spo2, steps, batteryLife] = values.map(Number);
    const out: Partial<SensorData> = {
      heartRate: isNaN(hr) ? null : hr,
      respRate: isNaN(brpm) ? null : brpm,
      spo2: isNaN(spo2) ? null : spo2,
      steps: isNaN(steps) ? 0 : Math.floor(steps),
      batteryLife: isNaN(batteryLife) ? null : batteryLife
    };
    console.log('Parsed from comma-separated values:', out);
    return out;
  }
  // ...existing code...
  let jsonData: any = null;
  let clean = trimmed;
  if (clean.startsWith('"') && clean.endsWith('"')) {
    clean = clean.slice(1, -1);
    if (clean.includes('\\"')) {
      clean = clean.replace(/\\"/g, '"');
    }
  }
  // Try JSON parse
  if (clean.startsWith('{') && clean.endsWith('}')) {
    try {
      jsonData = JSON.parse(clean);
    } catch (e) {
      console.log('parseMessage: JSON.parse failed', e);
    }
  }
  if (jsonData && typeof jsonData === 'object') {
    const out: Partial<SensorData> = {};
    if (jsonData.hr !== undefined) out.heartRate = Number(jsonData.hr);
    if (jsonData.brpm !== undefined) out.respRate = Number(jsonData.brpm);
    if (jsonData.spo2 !== undefined) out.spo2 = Number(jsonData.spo2);
    if (jsonData.steps !== undefined) out.steps = Math.floor(Number(jsonData.steps));
    if (jsonData.batteryLife !== undefined) out.batteryLife = Number(jsonData.batteryLife);
    console.log('Parsed from JSON:', out);
    return out;
  }
  // Fallback: regex for hr and brpm in partial JSON
  const out: Partial<SensorData> = {};
  const hrMatch = clean.match(/"hr":\s*([\d\.]+)/);
  if (hrMatch) out.heartRate = Number(hrMatch[1]);
  const brpmMatch = clean.match(/"brpm":\s*([\d\.]+)/);
  if (brpmMatch) out.respRate = Number(brpmMatch[1]);
  const spo2Match = clean.match(/"spo2":\s*([\d\.]+)/);
  if (spo2Match) out.spo2 = Number(spo2Match[1]);
  const stepsMatch = clean.match(/"steps":\s*([\d\.]+)/);
  if (stepsMatch) out.steps = Math.floor(Number(stepsMatch[1]));
  const batteryMatch = clean.match(/"batteryLife":\s*([\d\.]+)/);
  if (batteryMatch) out.batteryLife = Number(batteryMatch[1]);
  if (Object.keys(out).length > 0) {
    console.log('Parsed from regex:', out);
    return out;
  }
  // Fallback: key=value
  const pairs = clean.split(/[ ,]+/).map(p => p.trim()).filter(p => p.includes('='));
  pairs.forEach(pair => {
    const [key, val] = pair.split('=');
    if (key === 'hr') out.heartRate = Number(val);
    if (key === 'brpm') out.respRate = Number(val);
    if (key === 'spo2') out.spo2 = Number(val);
    if (key === 'steps') out.steps = Math.floor(Number(val));
    if (key === 'batteryLife') out.batteryLife = Number(val);
  });
  if (Object.keys(out).length > 0) {
    console.log('Parsed from key=value:', out);
    return out;
  }
  return out;
}

function mapJsonToSensor(parsed: any): Partial<SensorData> {
  if (!parsed || typeof parsed !== 'object') return {};
  const out: Partial<SensorData> = {};
  if (parsed.hr !== undefined && parsed.hr !== null) out.heartRate = Number(parsed.hr);
  if (parsed.temp !== undefined && parsed.temp !== null) out.temperature = Number(parsed.temp);
  if (parsed.spo2 !== undefined && parsed.spo2 !== null) out.spo2 = Number(parsed.spo2);
  if (parsed.brpm !== undefined && parsed.brpm !== null) out.respRate = Number(parsed.brpm);
  if (parsed.rr !== undefined && parsed.rr !== null) out.respRate = Number(parsed.rr);
  if (parsed.steps !== undefined && parsed.steps !== null) out.steps = Math.floor(Number(parsed.steps));
  return out;
}

// Simple simulator used when simulationMode is enabled
class VitalSignsSimulator {
  private baseHeartRate = 75.0;
  private baseTemperature = 98.2;
  private baseSpO2 = 98.0;
  private baseRespRate = 16.0;
  private steps = 7259;

  private hrVariation = 0;
  private tempVariation = 0;
  private spo2Variation = 0;
  private respVariation = 0;

  private addPhysiologicalVariation() {
    this.hrVariation += (Math.random() - 0.5) * 0.6;
    this.hrVariation *= 0.95; // decay

    this.tempVariation += (Math.random() - 0.5) * 0.02;
    this.tempVariation *= 0.98;

    this.spo2Variation += (Math.random() - 0.5) * 0.1;
    this.spo2Variation *= 0.9;

    this.respVariation = this.hrVariation * 0.2 + (Math.random() - 0.5) * 0.2;
  }

  generateSimulatedData(): SensorData {
    this.addPhysiologicalVariation();

    const heartRate = Math.round(
      Math.min(110, Math.max(50, this.baseHeartRate + this.hrVariation * 5))
    );

    const temperature = Number(
      Math.min(99.0, Math.max(97.0, this.baseTemperature + this.tempVariation)).toFixed(1)
    );

    const spo2 = Math.round(Math.min(100, Math.max(95, this.baseSpO2 + this.spo2Variation)));

    const respRate = Math.round(Math.min(20, Math.max(12, this.baseRespRate + this.respVariation)));

    const batteryLife = Math.round(Math.min(100, Math.max(10, 80 + (Math.random() - 0.5) * 10)));

    return {
      heartRate,
      temperature,
      spo2,
      respRate,
      steps: this.steps,
      batteryLife,
    };
  }
}

const simulator = new VitalSignsSimulator();

export function useSensorData() {
  const { connectedDevice, lastMessage, writeLine, simulationMode } = useBLEContext();
  const [data, setData] = useState<SensorData>(initialData);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Handle real device data
  useEffect(() => {
    if (simulationMode || !lastMessage) return;
    const update = parseMessage(lastMessage);
    if (Object.keys(update).length > 0) {
      // Only update the provided fields — previous values will be overwritten where present
      setData(prev => ({ ...prev, ...update }));
      setLastUpdate(new Date());
    }
  }, [lastMessage, simulationMode]);

  // Auto-request real device data every second when connected
  useEffect(() => {
    if (simulationMode || !connectedDevice) return;
    const interval = setInterval(() => {
      writeLine('get_sensors');
    }, 500); // lowered from 1000ms to 500ms
    return () => clearInterval(interval);
  }, [connectedDevice, writeLine, simulationMode]);

  // Reset on simulation mode change
  useEffect(() => {
    setData(initialData);
    setLastUpdate(null);
  }, [simulationMode]);

  // Simulator
  useEffect(() => {
    if (!simulationMode) return;
    const interval = setInterval(() => {
      setData(simulator.generateSimulatedData());
      setLastUpdate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [simulationMode]);

  const requestUpdate = useCallback(() => {
    if (simulationMode) {
      setData(simulator.generateSimulatedData());
      setLastUpdate(new Date());
    } else if (connectedDevice) {
      writeLine('get_sensors');
    }
  }, [simulationMode, connectedDevice, writeLine]);

  const isStale = useCallback(() => {
    if (!lastUpdate) return true;
    return (new Date().getTime() - lastUpdate.getTime()) > 5000;
  }, [lastUpdate]);

  return {
    data,
    lastUpdate,
    isStale,
    requestUpdate,
    isConnected: simulationMode || !!connectedDevice,
  };
}