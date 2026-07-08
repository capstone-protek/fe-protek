// src/lib/api.ts
import { mockDashboardSummary, mockAlerts, mockMachines, mockSensorData } from "../data/mockData";

// Helper sederhana untuk delay buatan (mock latency)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // --- DASHBOARD ---
  getStats: async () => {
    await delay(500);
    return mockDashboardSummary;
  },
  getDashboardAlerts: async () => {
    await delay(300);
    return mockAlerts;
  },
  getMachineHistory: async (machineId: string) => {
    console.log(`Getting history for ${machineId}`);
    return mockSensorData;
  },

  getMachineDetail: async (machineId: string) => {
    console.log(`Getting details for ${machineId}`);
    return mockMachines.find(m => m.asetId === machineId) || mockMachines[0];
  },

  // --- MACHINES ---
  getMachines: async () => {
    await delay(300);
    return mockMachines;
  },
  
  // --- ALERTS ---
  getAlerts: async () => {
    await delay(300);
    return mockAlerts;
  },

  // --- PREDICTION ---
  predict: async (data: any) => {
    await delay(800);
    return {
      status: 'success',
      input_saved: true,
      ml_result: {
        Machine_ID: data?.Machine_ID || "M-UNKNOWN",
        Risk_Probability: "85.2%",
        RUL_Estimate: "2 Jam Lagi",
        RUL_Status: "🚨 CRITICAL",
        RUL_Minutes: "120",
        Status: "⚠️ CRITICAL FAILURE DETECTED"
      }
    };
  },

  // --- SIMULATION ---
  startSimulation: async () => {
    await delay(500);
    return { status: "success", message: "Simulation started", is_running: true };
  },
  stopSimulation: async () => {
    await delay(500);
    return { status: "success", message: "Simulation stopped", is_running: false };
  }, 
  getSimulationStatus: async () => {
    await delay(200);
    return { is_running: false };
  },
};