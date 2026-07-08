// src/data/mockData.ts
import type { AlertData, DashboardSummaryResponse, MachineDetailResponse, SensorDataPoint } from "@/types";

export const mockAlerts: AlertData[] = [
  {
    id: 1,
    message: "Tool Wear Failure",
    severity: "CRITICAL",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    machine: {
      name: "CNC Grinder 01",
      asetId: "M-14850",
    }
  },
  {
    id: 2,
    message: "Overheat",
    severity: "WARNING",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    machine: {
      name: "Lathe Machine 02",
      asetId: "M-15200",
    }
  },
];

export const mockDashboardSummary: DashboardSummaryResponse = {
  summary: {
    totalMachines: 25,
    criticalMachines: 2,
    todaysAlerts: 5,
    systemHealth: 85,
  },
  recentAlerts: mockAlerts,
};

export const mockMachines: MachineDetailResponse[] = [
  {
    id: 1,
    asetId: "M-14850",
    name: "CNC Grinder 01",
    status: "CRITICAL",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    asetId: "M-15200",
    name: "Lathe Machine 02",
    status: "WARNING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    asetId: "M-14900",
    name: "Drill Press 03",
    status: "HEALTHY",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockSensorData: SensorDataPoint[] = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  machine_id: 1,
  type: "sensor",
  air_temperature_K: 298 + Math.random() * 5,
  process_temperature_K: 308 + Math.random() * 10,
  rotational_speed_rpm: 1500 + Math.random() * 100,
  torque_Nm: 40 + Math.random() * 10,
  tool_wear_min: 120 + Math.random() * 20,
  insertion_time: new Date(Date.now() - (20 - i) * 5000).toISOString(),
}));

export const healthTrendData = [
  { time: '00:00', value: 80 },
  { time: '04:00', value: 78 },
  { time: '08:00', value: 75 },
  { time: '12:00', value: 70 },
  { time: '16:00', value: 65 },
  { time: '20:00', value: 60 },
];
