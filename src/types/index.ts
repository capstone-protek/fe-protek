/*
 * ==========================================================
 * ACTIVE FRONTEND DATA CONTRACTS
 * ==========================================================
 * Public boundary fields intentionally retain the casing used by the
 * currently deployed backend compatibility layer.
 * ==========================================================
 */

// ==========================================================
// 1. PREDICTION REQUEST (LEGACY PASCALCASE, STILL ACCEPTED BY BACKEND)
// ==========================================================

export interface PredictPayload {
  Machine_ID: string;   // String
  Type: string;         // String
  Air_Temp: number;     // Number
  Process_Temp: number; // Number (> 0)
  RPM: number;          // Integer (> 0)
  Torque: number;       // Number (>= 0)
  Tool_Wear: number;    // Integer (>= 0)
}

// ==========================================================
// 2. PREDICTION DATA RETURNED BY THE BACKEND
// ==========================================================

export interface PredictionData {
  machineId: string;
  
  // Data Statistik (Selalu ada berupa String)
  riskProbability: string; // "78.3%"
  rulEstimate: string;     // "0 Menit Lagi"
  rulStatus: string;       // "🚨 CRITICAL"
  rulMinutes: string;      // "0"
  status: string;          // "⚠️ CRITICAL FAILURE DETECTED"

  // Field Opsional (Tergantung Normal vs Critical)
  // Di screenshot 'Critical', Message & Recommendation TIDAK MUNCUL.
  message?: string;
  recommendation?: string;

  // Field Tambahan saat Failure
  failureType?: string;    // "Power Failure"
  action?: string;         // "Cek tegangan..."
  urgency?: string;        // "🚨 SANGAT MENDESAK..."
  timestamp: string;
}

// ==========================================================
// 3. ENUMS & SHARED TYPES
// ==========================================================

export type MachineStatus = 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'OFFLINE';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

// ==========================================================
// 4. RESPONSE DATA (FE CONSUMPTION)
// ==========================================================

export interface AlertData {
  id: number;
  message: string;
  severity: string;
  timestamp: Date | string; 
  machine: {
    name: string;
    asetId: string;
  };
}

export interface DashboardSummaryResponse {
  summary: {
    totalMachines: number;
    criticalMachines: number;
    todaysAlerts: number;
    systemHealth: number;
  };
  recentAlerts: AlertData[];
}

export interface MachineDetailResponse {
  id: number;
  asetId: string;
  name: string;
  status: MachineStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SensorHistoryData {
  id: number;
  type: string;
  value: number;
  timestamp: string;
  machineId: number;
}

export interface SensorDataPoint {
  id: number;
  machine_id: number;
  type: string;
  air_temperature_K: number;
  process_temperature_K: number;
  rotational_speed_rpm: number;
  torque_Nm: number;
  tool_wear_min: number;
  insertion_time: string;
}

// ==========================================================
// 5. API RESPONSE WRAPPERS
// ==========================================================

export interface PredictResponse {
  success: boolean;
  status: 'success' | 'error';
  message: string;
  data: PredictionData;
  databaseSaved: boolean;
  alertCreated: boolean;
}
