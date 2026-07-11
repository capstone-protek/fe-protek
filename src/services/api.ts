// src/services/api.ts
import axios from "axios";
import type { 
  MachineDetailResponse, 
  PredictPayload
} from "../types";
import { healthTrendData } from "../data/mockData";

const API_URL = import.meta.env.VITE_API_URL || "https://be-protek-production.up.railway.app/api";

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
    try {
      const response = await api.post("/simulation/start");
      return response.data;
    } catch (err: any) {
      console.error("Simulation Start Error:", err);
      return { status: "error", message: "Failed to start simulation (AI Service unreachable)", is_running: false };
    }
  },
  stop: async () => {
    try {
      const response = await api.get("/simulation/stop");
      return response.data;
    } catch (err: any) {
      console.error("Simulation Stop Error:", err);
      return { status: "error", message: "Failed to stop simulation", is_running: false };
    }
  },
  getStatus: async () => {
    try {
      const response = await api.get("/simulation/status");
      return response.data;
    } catch (err: any) {
      return { is_running: false, message: "Simulation status offline" };
    }
  }
};

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get("/dashboard/summary");
    return response.data;
  },

  getTrend: async () => {
    // Keep using mock data for trend as there is no specific endpoint
    return healthTrendData;
  },

  getMachines: async () => {
    try {
      const response = await api.get("/machines");
      const dataArray = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      return dataArray.map((m: any) => ({
        ...m,
        asetId: m.machine_id || m.machineId || m.asetId || `M-${m.id}`,
        createdAt: m.created_at || m.createdAt || m.created_at || new Date().toISOString(),
        updatedAt: m.updated_at || m.updatedAt || m.updated_at || new Date().toISOString()
      })) as MachineDetailResponse[];
    } catch (error) {
      console.error("Failed to fetch machines:", error);
      return [];
    }
  },

  getMachineDetail: async (asetId: string) => {
    try {
      const response = await api.get(`/machines/${asetId}`);
      const data = response.data?.data || response.data;
      return {
        ...data,
        asetId: data.machine_id || data.machineId || data.asetId || asetId,
        createdAt: data.created_at || data.createdAt || data.created_at || new Date().toISOString(),
        updatedAt: data.updated_at || data.updatedAt || data.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Failed to fetch detail for ${asetId}:`, error);
      return null;
    }
  },

  getSensors: async (asetId: string) => {
    try {
      const response = await api.get(`/machines/${asetId}/history`);
      const dataArray = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      return dataArray.map((d: any) => ({
        ...d,
        air_temperature_K: d.air_temperature_k ?? d.air_temperature_K,
        process_temperature_K: d.process_temperature_k ?? d.process_temperature_K,
        torque_Nm: d.torque_nm ?? d.torque_Nm,
        rotational_speed_rpm: d.rotational_speed_rpm,
        tool_wear_min: d.tool_wear_min,
        insertion_time: d.insertion_time || d.timestamp || new Date().toISOString()
      }));
    } catch (error) {
      console.error(`Failed to fetch sensors for ${asetId}:`, error);
      return [];
    }
  },

  getSensorData: async (asetId: string) => {
    return dashboardService.getSensors(asetId);
  },

  getHistory: async (asetId: string) => {
    return dashboardService.getSensors(asetId);
  },

  getAlerts: async () => {
    const response = await api.get("/alerts");
    if (response.data && response.data.alerts) {
      return response.data.alerts;
    }
    return response.data;
  },

  getAlertDetail: async (alertId: number) => {
    const response = await api.get("/alerts");
    const alerts = response.data && response.data.alerts ? response.data.alerts : response.data;
    return alerts.find((a: any) => a.id === alertId);
  },

  getPredict: async (payload: PredictPayload) => {
    const response = await api.post("/predict", payload);
    return response.data;
  },

  sendMessage: async (message: string) => {
    try {
      const response = await api.post("/chat", { message });
      return response.data;
    } catch (error) {
      console.error("Chat API Error:", error);
      return { reply: "Maaf, terjadi gangguan koneksi ke server AI." };
    }
  }
};

export default api;