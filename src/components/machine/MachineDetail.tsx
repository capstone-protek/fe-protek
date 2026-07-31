import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/api";
import type { AlertData } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { icon: typeof AlertTriangle; label: string; className: string }> = {
  HEALTHY: { icon: CheckCircle, label: "Healthy", className: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  WARNING: { icon: AlertTriangle, label: "At Risk", className: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30" },
  CRITICAL: { icon: XCircle, label: "Critical", className: "text-red-600 bg-red-100 dark:bg-red-900/30" },
  OFFLINE: { icon: Info, label: "Offline", className: "text-gray-500 bg-gray-100 dark:bg-gray-800" },
};

export function MachineDetail() {
  const { asetId } = useParams<{ asetId: string }>();
  const machineId = asetId || "";

  const { data: machine, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['machine-detail', machineId],
    queryFn: () => dashboardService.getMachineDetail(machineId),
    enabled: !!machineId,
  });

  const { data: sensorHistoryData = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['machine-history', machineId],
    queryFn: () => dashboardService.getHistory(machineId),
    enabled: !!machineId,
    refetchInterval: 5000,
  });

  const { data: alerts = [], isLoading: isLoadingAlerts } = useQuery<AlertData[]>({
    queryKey: ['machine-alerts', machineId],
    queryFn: () => dashboardService.getAlerts(),
    enabled: !!machineId,
    refetchInterval: 5000,
  });

  const latestReading = useMemo(() => {
    if (!sensorHistoryData || sensorHistoryData.length === 0) return null;
    return sensorHistoryData[sensorHistoryData.length - 1];
  }, [sensorHistoryData]);

  const chartData = useMemo(() => {
    if (!sensorHistoryData || sensorHistoryData.length === 0) return [];
    return sensorHistoryData.map(d => ({
      time: new Date(d.insertion_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      temp: d.air_temperature_K,
      process: d.process_temperature_K,
      torque: d.torque_Nm,
      rpm: d.rotational_speed_rpm,
    }));
  }, [sensorHistoryData]);

  if (isLoadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Loading machine details...</p>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center min-h-[60vh]">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Machine Not Found</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Mesin dengan ID <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{machineId}</span> tidak ditemukan.
        </p>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const statusKey = machine.status || "OFFLINE";
  const status = statusConfig[statusKey] || statusConfig["OFFLINE"];
  const StatusIcon = status.icon;
  const machineAlerts = alerts.filter((a: AlertData) => a.machine.asetId === machineId);

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="h-10 w-10">
            <Link to="/machines">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              {machine.name}
              <Badge variant="outline" className={cn("px-2.5 py-0.5 border-0 font-medium", status.className)}>
                <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                {status.label}
              </Badge>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground text-sm">Asset ID:</span>
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{machine.asetId}</code>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm h-fit">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              Machine Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Status</p>
                <p className={cn("font-semibold inline-flex items-center gap-1.5", status.className.replace('bg-', 'text-').split(' ')[0])}>
                  <span className={`h-2 w-2 rounded-full ${statusKey === 'HEALTHY' ? 'bg-green-500' : statusKey === 'CRITICAL' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                  {machine.status}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Install Date</p>
                <p className="font-medium">{new Date(machine.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sensor Data</CardTitle>
            <CardDescription>Current readings from machine sensors</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <p className="text-sm text-muted-foreground">Loading sensor data...</p>
            ) : latestReading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Air Temperature</p>
                  <p className="font-semibold">{latestReading.air_temperature_K.toFixed(1)} K</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Process Temperature</p>
                  <p className="font-semibold">{latestReading.process_temperature_K.toFixed(1)} K</p>
                </div>
                <div>
                  <p className="text-muted-foreground">RPM</p>
                  <p className="font-semibold">{Math.round(latestReading.rotational_speed_rpm)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Torque</p>
                  <p className="font-semibold">{latestReading.torque_Nm.toFixed(1)} Nm</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tool Wear</p>
                  <p className="font-semibold">{Math.round(latestReading.tool_wear_min)} min</p>
                </div>
                <p className="font-mono text-sm font-semibold">
                  {new Date(latestReading.insertion_time).toLocaleString('id-ID')}
                </p>
              </div>
            ) : (
              <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-xs text-destructive">
                <p className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" /> No Data Received
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Real-time Sensor Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-2">
            {isLoadingHistory ? (
               <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                 <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
               </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="time" tick={{fontSize: 12}} />
                  <YAxis yAxisId="left" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="temp" name="Air Temp (K)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="process" name="Process Temp (K)" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="torque" name="Torque (Nm)" stroke="#eab308" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="rpm" name="RPM" stroke="#8b5cf6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                No historical data available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAlerts ? (
              <p className="text-sm text-muted-foreground">Loading alerts...</p>
            ) : machineAlerts.length > 0 ? (
              <div className="space-y-3">
                {machineAlerts.map((alert: AlertData) => (
                  <div key={alert.id} className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={alert.severity === "CRITICAL" ? "destructive" : alert.severity === "WARNING" ? "default" : "secondary"}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{alert.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active alerts</p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

export default MachineDetail;
