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

const normalizeSensorHistory = (rows: any[]) => {
  if (!rows.some((row) => row?.type !== undefined && row?.value !== undefined)) {
    return rows;
  }

  const grouped = new Map<string, any>();

  rows.forEach((row) => {
    const timestamp = row.timestamp || row.insertion_time || new Date().toISOString();
    const key = `${row.machineId ?? row.machine_id ?? "unknown"}-${timestamp}`;
    const current = grouped.get(key) || {
      id: row.id,
      machine_id: row.machineId ?? row.machine_id,
      insertion_time: timestamp,
    };

    const type = String(row.type).toLowerCase().replace(/[^a-z]/g, "");
    if (type === "airtemp" || type === "airtemperature") current.air_temperature_K = row.value;
    if (type === "processtemp" || type === "processtemperature") current.process_temperature_K = row.value;
    if (type === "rpm" || type === "rotationalspeed") current.rotational_speed_rpm = row.value;
    if (type === "torque") current.torque_Nm = row.value;
    if (type === "toolwear") current.tool_wear_min = row.value;

    grouped.set(key, current);
  });

  return Array.from(grouped.values());
};

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

export interface ChatResponse {
  intent: string;
  entity: string | null;
  response_text: string;
}

export interface MaintenanceTicket {
  id: number;
  title: string;
  description: string;
  failureType: string;
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";
  source: string;
  createdAt: string;
  machine: { name: string; asetId: string };
  alert?: { id: number; message: string; severity: string } | null;
}

export interface RagResult {
  document_id: string;
  title: string;
  failure_type: string;
  source: string;
  chunk: number;
  score: number;
  content: string;
}

export interface EvaluationDetail {
  case_id: string;
  category: string;
  failure_type_correct: boolean;
  ticket_decision_correct: boolean;
  retrieval_hit: boolean;
  expected_source: string;
  retrieved_sources: string[];
  explainability_pass: boolean;
  hallucination_detected: boolean;
  latency_ms: number;
}

export interface EvaluationResult {
  dataset_id: string;
  provenance: string;
  mode: string;
  total_cases: number;
  metrics: {
    failure_type_accuracy: number;
    ticket_decision_accuracy: number;
    retrieval_hit_rate_at_k: number;
    explainability_pass_rate: number;
    hallucination_rate: number;
    average_retrieval_latency_ms: number;
  };
  details: EvaluationDetail[];
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
      const response = await api.post("/simulation/stop");
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
      return normalizeSensorHistory(dataArray).map((d: any) => ({
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
      const data = response.data;
      return {
        ...data,
        response_text: data.response_text || "Maaf, server tidak mengembalikan jawaban chatbot.",
      } as ChatResponse;
    } catch (error) {
      console.error("Chat API Error:", error);
      return {
        intent: "UNKNOWN",
        entity: null,
        response_text: "Maaf, terjadi gangguan koneksi ke server AI.",
      } as ChatResponse;
    }
  }
};

export const ticketService = {
  list: async (): Promise<MaintenanceTicket[]> => {
    const response = await api.get("/tickets");
    return response.data;
  },
  updateStatus: async (ticketId: number, status: MaintenanceTicket["status"]): Promise<MaintenanceTicket> => {
    const response = await api.patch(`/tickets/${ticketId}/status`, { status });
    return response.data;
  },
};

export const aiEvaluationService = {
  searchKnowledge: async (query: string, topK: number): Promise<{ query: string; results: RagResult[] }> => {
    const response = await api.post("/ai-evaluation/rag/search", { query, topK });
    return response.data;
  },
  run: async (limit?: number): Promise<EvaluationResult> => {
    const response = await api.post("/ai-evaluation/run", limit ? { limit } : {});
    return response.data;
  },
  summary: async (): Promise<Omit<EvaluationResult, "details"> | { status: string }> => {
    const response = await api.get("/ai-evaluation/summary");
    return response.data;
  },
};

export default api;
