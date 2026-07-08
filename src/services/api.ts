// src/services/api.ts
import axios from "axios";
import type { 
  MachineDetailResponse, 
  PredictPayload
} from "../types";
import { mockDashboardSummary, mockAlerts, healthTrendData, mockMachines, mockSensorData } from "../data/mockData";

// Helper sederhana untuk delay buatan (mock latency)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const API_URL = import.meta.env.VITE_API_URL || "https://api-protek-production.up.railway.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface SimulationResponse {
  status: "success" | "error";
  message: string;
  is_running?: boolean;
}

export interface TrendDataPoint {
  time: string;
  healthScore: number;
  machineId: string;
}

export interface DebugMatchItem {
  mesin: string;
  kode: string;
  status_saat_ini: string;
  prediksi_ml: {
    sisa_umur_rul: string;
    risiko_kerusakan: string;
    status_prediksi: string;
  } | string; 
}

export interface ChatResponse {
  reply: string;
  debug_match?: DebugMatchItem[]; 
}

// --- SERVICES ---

export const simulationService = {
  start: async () => {
    await delay(500);
    return { status: "success", message: "Simulasi dimulai", is_running: true };
  },
  stop: async () => {
    await delay(500);
    return { status: "success", message: "Simulasi dihentikan", is_running: false };
  },
  getStatus: async () => {
    await delay(200);
    return { is_running: false };
  }
};

export const dashboardService = {
  getSummary: async () => {
    await delay(500);
    return mockDashboardSummary;
  },

  getTrend: async () => {
    await delay(300);
    return healthTrendData;
  },

  getMachines: async () => {
    await delay(300);
    return mockMachines as MachineDetailResponse[];
  },

  getMachineDetail: async (asetId: string) => {
    await delay(300);
    return mockMachines.find(m => m.asetId === asetId) || mockMachines[0];
  },

  getSensors: async (_asetId: string) => {
    await delay(300);
    return mockSensorData;
  },

  getSensorData: async (_asetId: string) => {
    await delay(300);
    return mockSensorData;
  },

  getHistory: async (_asetId: string) => {
    await delay(300);
    return mockSensorData;
  },

  getAlerts: async () => {
    await delay(300);
    return mockAlerts;
  },

  getAlertDetail: async (alertId: number) => {
    await delay(300);
    return mockAlerts.find(a => a.id === alertId) || mockAlerts[0];
  },

  getPredict: async (payload: PredictPayload) => {
    await delay(800);
    return {
      status: 'success',
      input_saved: true,
      ml_result: {
        Machine_ID: payload.Machine_ID,
        Risk_Probability: "85.2%",
        RUL_Estimate: "2 Jam Lagi",
        RUL_Status: "🚨 CRITICAL",
        RUL_Minutes: "120",
        Status: "⚠️ CRITICAL FAILURE DETECTED"
      }
    };
  },

  sendMessage: async (_message: string) => {
    await delay(500);
    return { reply: "Ini adalah balasan dummy karena belum ada API Chat." };
  }
};

export default api;