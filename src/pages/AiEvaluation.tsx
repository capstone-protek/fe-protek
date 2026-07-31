import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Activity, BookOpen, BrainCircuit, Clock3, Database, Search, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { aiEvaluationService, type EvaluationResult } from "@/services/api";

const percent = (value: number) => `${(value * 100).toFixed(0)}%`;

function PassBadge({ pass }: { pass: boolean }) {
  return <Badge variant={pass ? "secondary" : "destructive"}>{pass ? "PASS" : "FAIL"}</Badge>;
}

export default function AiEvaluation() {
  const [query, setQuery] = useState("power failure high torque rpm inspect electrical supply");
  const [topK, setTopK] = useState(3);
  const [limit, setLimit] = useState(25);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const ragSearch = useMutation({
    mutationFn: () => aiEvaluationService.searchKnowledge(query, topK),
  });
  const runEvaluation = useMutation({
    mutationFn: () => aiEvaluationService.run(limit),
    onSuccess: setEvaluation,
  });

  const metrics = evaluation?.metrics;
  const metricCards = metrics ? [
    { label: "Failure Accuracy", value: percent(metrics.failure_type_accuracy), icon: BrainCircuit },
    { label: "Ticket Decision", value: percent(metrics.ticket_decision_accuracy), icon: Activity },
    { label: "Retrieval Hit@3", value: percent(metrics.retrieval_hit_rate_at_k), icon: Database },
    { label: "Explainability", value: percent(metrics.explainability_pass_rate), icon: BookOpen },
    { label: "Hallucination", value: percent(metrics.hallucination_rate), icon: ShieldCheck },
    { label: "Avg. Retrieval", value: `${metrics.average_retrieval_latency_ms.toFixed(2)} ms`, icon: Clock3 },
  ] : [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Evaluation</h1>
          <p className="text-muted-foreground">Eksplorasi RAG dan evaluasi deterministik workflow multi-agent PROTEK.</p>
        </div>

        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Offline read-only evaluation</AlertTitle>
          <AlertDescription>Evaluator tidak memanggil Gemini dan tidak membuat alert atau maintenance ticket.</AlertDescription>
        </Alert>

        <Tabs defaultValue="rag" className="space-y-5">
          <TabsList>
            <TabsTrigger value="rag">RAG Playground</TabsTrigger>
            <TabsTrigger value="evaluation">Agent Evaluation</TabsTrigger>
          </TabsList>

          <TabsContent value="rag" className="space-y-5">
            <Card>
              <CardHeader><CardTitle>Knowledge Retrieval</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row">
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Masukkan query maintenance..." />
                  <Input className="md:w-24" type="number" min={1} max={10} value={topK} onChange={(event) => setTopK(Number(event.target.value))} />
                  <Button onClick={() => ragSearch.mutate()} disabled={ragSearch.isPending || query.trim().length < 3}>
                    <Search className="mr-2 h-4 w-4" />{ragSearch.isPending ? "Searching..." : "Search"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Top K menentukan jumlah potongan knowledge yang diambil dari Chroma vector database.</p>
                {ragSearch.isError && <p className="text-sm text-destructive">Retrieval gagal. Pastikan AI service berjalan.</p>}
              </CardContent>
            </Card>

            <div className="space-y-3">
              {ragSearch.data?.results.map((result, index) => (
                <Card key={`${result.document_id}-${result.chunk}`}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">{index + 1}. {result.title}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">{result.document_id} · Chunk {result.chunk}</p>
                      </div>
                      <div className="flex gap-2"><Badge>{result.failure_type}</Badge><Badge variant="outline">Score {result.score.toFixed(4)}</Badge></div>
                    </div>
                  </CardHeader>
                  <CardContent><p className="whitespace-pre-wrap text-sm leading-6">{result.content}</p></CardContent>
                </Card>
              ))}
              {ragSearch.isSuccess && ragSearch.data.results.length === 0 && <p className="text-muted-foreground">Tidak ada knowledge ditemukan.</p>}
            </div>
          </TabsContent>

          <TabsContent value="evaluation" className="space-y-5">
            <Card>
              <CardHeader><CardTitle>Golden Dataset Evaluation</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="flex items-center gap-2"><span className="text-sm">Jumlah kasus:</span><Input className="w-24" type="number" min={1} max={25} value={limit} onChange={(event) => setLimit(Number(event.target.value))} /></div>
                  <Button onClick={() => runEvaluation.mutate()} disabled={runEvaluation.isPending || limit < 1 || limit > 25}>
                    <Activity className="mr-2 h-4 w-4" />{runEvaluation.isPending ? "Evaluating..." : "Run Evaluation"}
                  </Button>
                </div>
                {runEvaluation.isError && <p className="text-sm text-destructive">Evaluasi gagal dijalankan.</p>}
                {evaluation && <div className="flex flex-wrap gap-2"><Badge variant="outline">{evaluation.dataset_id}</Badge><Badge variant="secondary">{evaluation.mode}</Badge><Badge variant="outline">{evaluation.total_cases} cases</Badge></div>}
              </CardContent>
            </Card>

            {metrics && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {metricCards.map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div><Icon className="h-8 w-8 text-primary" /></CardContent></Card>)}
            </div>}

            {evaluation && <Card>
              <CardHeader><CardTitle>Case Details</CardTitle><p className="text-sm text-muted-foreground">{evaluation.provenance}</p></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Case</TableHead><TableHead>Category</TableHead><TableHead>Failure</TableHead><TableHead>Ticket</TableHead><TableHead>Retrieval</TableHead><TableHead>Explainability</TableHead><TableHead>Hallucination</TableHead><TableHead>Latency</TableHead></TableRow></TableHeader>
                  <TableBody>{evaluation.details.map((detail) => <TableRow key={detail.case_id}>
                    <TableCell className="font-medium">{detail.case_id}</TableCell><TableCell>{detail.category}</TableCell><TableCell><PassBadge pass={detail.failure_type_correct} /></TableCell><TableCell><PassBadge pass={detail.ticket_decision_correct} /></TableCell><TableCell><PassBadge pass={detail.retrieval_hit} /></TableCell><TableCell><PassBadge pass={detail.explainability_pass} /></TableCell><TableCell><PassBadge pass={!detail.hallucination_detected} /></TableCell><TableCell>{detail.latency_ms.toFixed(2)} ms</TableCell>
                  </TableRow>)}</TableBody>
                </Table>
              </CardContent>
            </Card>}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
