import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ticketService, type MaintenanceTicket } from "@/services/api";

const nextStatuses: Record<MaintenanceTicket["status"], MaintenanceTicket["status"][]> = {
  OPEN: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "CANCELLED"],
  RESOLVED: [],
  CANCELLED: [],
};

export default function Tickets() {
  const queryClient = useQueryClient();
  const { data: tickets = [], isLoading, isError } = useQuery({
    queryKey: ["tickets"],
    queryFn: ticketService.list,
    refetchInterval: 5000,
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: MaintenanceTicket["status"] }) =>
      ticketService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Tickets</h1>
          <p className="text-muted-foreground">Ticket otomatis dari workflow multi-agent AI.</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Daftar Ticket</CardTitle></CardHeader>
          <CardContent>
            {isLoading && <p>Memuat ticket...</p>}
            {isError && <p className="text-destructive">Gagal memuat ticket.</p>}
            {!isLoading && tickets.length === 0 && <p className="text-muted-foreground">Belum ada ticket.</p>}
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">#{ticket.id} — {ticket.title}</p>
                      <p className="text-sm text-muted-foreground">{ticket.machine.asetId} · {ticket.machine.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="destructive">{ticket.urgency}</Badge>
                      <Badge variant="outline">{ticket.status}</Badge>
                      <Badge variant="secondary">{ticket.source}</Badge>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{ticket.description}</p>
                  <div className="flex items-center gap-2">
                    {nextStatuses[ticket.status].map((status) => (
                      <button
                        key={status}
                        className="rounded border px-3 py-1 text-sm hover:bg-secondary disabled:opacity-50"
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ id: ticket.id, status })}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
