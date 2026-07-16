"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { Camera, ShieldAlert, UploadCloud, Cpu } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { classifyImage, evaluateAbcde } from "@/lib/api/healthguard";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

export function ScreenerScreen() {
  const [result, setResult] = useState<{
    observations: Array<{ label: string; score: number }>;
    recommendation: string;
    risk_level?: string;
    confidence?: number;
    abcde_score?: number;
    key_risk_factors?: Array<{ feature: string; label: string; importance: number }>;
  } | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "analyzing" | "completed" | "failed">("idle");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tabular ABCDE Clinical Screening State
  const [abcdeState, setAbcdeState] = useState({
    asymmetry: false,
    border_irregular: false,
    color_variation: false,
    diameter_gt_6mm: false,
    evolving: false,
    itching_or_pain: false,
    bleeding_or_crust: false,
    new_lesion: false,
  });

  const handleAbcdeToggle = (key: keyof typeof abcdeState) => {
    setAbcdeState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEvaluateAbcde = async () => {
    setIsLoading(true);
    setAnalysisStatus("analyzing");
    toast("Evaluating ABCDE clinical heuristics...");
    try {
      const res = await evaluateAbcde(abcdeState);
      const formattedObservations = [
        { label: `Risk Assessment: ${res.risk_level}`, score: res.confidence },
        ...res.key_risk_factors.map((f) => ({ label: `Factor: ${f.label}`, score: f.importance / 100 })),
      ];
      const data = {
        observations: formattedObservations,
        recommendation: res.recommendation,
        risk_level: res.risk_level,
        confidence: res.confidence,
        abcde_score: res.abcde_score,
        key_risk_factors: res.key_risk_factors,
      };
      setResult(data);
      setAnalysisStatus("completed");
      toast.success("ABCDE risk assessment completed");
    } catch {
      toast.error("Could not evaluate ABCDE parameters");
      setAnalysisStatus("failed");
    } finally {
      setIsLoading(false);
    }
  };

  const classifyMutation = useMutation<{
    observations: Array<{ label: string; score: number }>;
    recommendation: string;
    risk_level?: string;
    confidence?: number;
  }, unknown, File>({
    mutationFn: (file: File) => classifyImage(file),
    onMutate: () => {
      setAnalysisStatus("analyzing");
      setIsLoading(true);
      toast("Analyzing image...");
    },
    onSuccess: (data) => {
      setResult(data);
      setAnalysisStatus("completed");
      toast.success("Image analysis completed");
    },
    onError: () => {
      setAnalysisStatus("failed");
      toast.error("Could not analyze image");
    },
    onSettled: () => {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    classifyMutation.mutate(file);
  }

  const abcdeItems = [
    { key: "asymmetry", label: "Asymmetrical shape (A)", desc: "One half unlike the other" },
    { key: "border_irregular", label: "Irregular borders (B)", desc: "Jagged, notched, or blurred" },
    { key: "color_variation", label: "Color variation (C)", desc: "Multiple shades of brown, black, or red" },
    { key: "diameter_gt_6mm", label: "Diameter > 6mm (D)", desc: "Larger than a pencil eraser" },
    { key: "evolving", label: "Evolving / changing (E)", desc: "Growing or changing color rapidly" },
    { key: "itching_or_pain", label: "Itching or tenderness", desc: "Active discomfort or burning" },
    { key: "bleeding_or_crust", label: "Bleeding or crusting", desc: "Surface oozing or scabbing" },
    { key: "new_lesion", label: "Recently appeared", desc: "New lesion within past 3 months" },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dermatological Risk Screener</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Evaluate lesion asymmetry, border irregularity, color variation, diameter, and evolution using clinical heuristics.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          {/* Tabular ABCDE Screening Form */}
          <SectionCard
            title="Interactive ABCDE checklist"
            description="Toggle any clinical signs you observe on the skin lesion or rash."
          >
            <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {abcdeItems.map((item) => {
                const isChecked = abcdeState[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleAbcdeToggle(item.key)}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition",
                      isChecked ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-muted",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 rounded accent-primary cursor-pointer"
                    />
                    <div>
                      <p className={cn("text-sm font-semibold", isChecked ? "text-primary" : "text-foreground")}>
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button onClick={handleEvaluateAbcde} disabled={isLoading} className="w-full">
              <Cpu className="h-4 w-4" /> Evaluate ABCDE clinical risk
            </Button>
          </SectionCard>

          <SectionCard
            title="Or upload a photo for visual heuristics"
            description="Image-based RGB variance and aspect skew heuristics."
            action={<Badge variant="outline">Educational only</Badge>}
          >
            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center transition hover:bg-muted/50">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Upload skin photo for heuristic scan</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP supported</p>
              </div>
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept="image/*"
                onChange={handleUpload}
              />
            </label>
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-800">
                This feature is for educational risk triage. Always consult an in-person dermatologist.
              </p>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Assessment results"
          description="Confidence-ranked heuristic observations and triage recommendations."
        >
          {analysisStatus === "analyzing" && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3.5 text-sm font-semibold text-blue-800">
              Running risk evaluation…
            </div>
          )}
          {analysisStatus === "failed" && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm font-semibold text-red-700">
              Assessment failed. Please verify your inputs.
            </div>
          )}
          {!result ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                <Camera className="h-7 w-7" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">No assessment generated yet</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Toggle your ABCDE checklist items or upload a photo to generate a risk score.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {result.risk_level && (
                <div className={cn(
                  "rounded-lg border p-4",
                  result.risk_level.includes("High Risk") ? "border-red-200 bg-red-50 text-red-900" :
                  result.risk_level.includes("Moderate") ? "border-amber-200 bg-amber-50 text-amber-900" :
                  "border-green-200 bg-green-50 text-green-900",
                )}>
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider">Triage classification</span>
                  <h3 className="text-xl font-bold">{result.risk_level}</h3>
                  {result.confidence !== undefined && (
                    <p className="mt-1 text-sm font-medium">Model confidence: {round(result.confidence * 100, 1)}%</p>
                  )}
                </div>
              )}

              <div className="space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Feature importance breakdown</p>
                {result.observations.map((observation) => (
                  <div
                    key={observation.label}
                    className="rounded-lg border border-border bg-white px-3.5 py-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-foreground">{observation.label}</p>
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                        {(observation.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, observation.score * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-6">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-primary">Clinical recommendation</span>
                <p className="text-foreground/80">{result.recommendation}</p>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function round(val: number, decimals: number) {
  return Number(val.toFixed(decimals));
}
