"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Camera, ShieldAlert, UploadCloud, CheckSquare, Sparkles, Cpu } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { classifyImage, evaluateAbcde } from "@/lib/api/healthguard";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();

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
    toast("Evaluating ABCDE clinical heuristics with gradient-boosted trees...", { icon: "⚙️" });
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
      toast.success("ABCDE Risk Assessment completed!");
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
      toast("Analyzing image...", { icon: "⏳" });
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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dermatological Risk Assessor"
        title="Gradient-boosted ABCDE clinical screening & visual heuristics"
        description="We evaluate lesion asymmetry, border irregularity, color variation, diameter, and evolution without heavy vision transformer RAM bloat."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <div className="space-y-6">
          {/* Tabular ABCDE Screening Form */}
          <SectionCard
            title="Interactive ABCDE Checklist"
            description="Toggle any clinical signs you observe on the skin lesion or rash."
            action={<Badge className="bg-emerald-600 text-white">Gradient Boosted</Badge>}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                { key: "asymmetry", label: "Asymmetrical Shape (A)", desc: "One half unlike the other" },
                { key: "border_irregular", label: "Irregular Borders (B)", desc: "Jagged, notched, or blurred" },
                { key: "color_variation", label: "Color Variation (C)", desc: "Multiple shades of brown, black, or red" },
                { key: "diameter_gt_6mm", label: "Diameter > 6mm (D)", desc: "Larger than a pencil eraser" },
                { key: "evolving", label: "Evolving / Changing (E)", desc: "Growing or changing color rapidly" },
                { key: "itching_or_pain", label: "Itching or Tenderness", desc: "Active discomfort or burning" },
                { key: "bleeding_or_crust", label: "Bleeding or Crusting", desc: "Surface oozing or scabbing" },
                { key: "new_lesion", label: "Recently Appeared", desc: "New lesion within past 3 months" },
              ].map((item) => {
                const isChecked = abcdeState[item.key as keyof typeof abcdeState];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleAbcdeToggle(item.key as keyof typeof abcdeState)}
                    className={`cursor-pointer rounded-2xl border p-4 transition flex items-start gap-3 ${
                      isChecked ? "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/20 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                    />
                    <div>
                      <p className={`text-sm font-bold ${isChecked ? "text-emerald-900 dark:text-emerald-300" : "text-slate-800"}`}>{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={handleEvaluateAbcde}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold py-6 rounded-xl shadow-md"
            >
              <Cpu className="h-4 w-4 mr-2" /> Evaluate ABCDE Clinical Risk
            </Button>
          </SectionCard>

          <SectionCard
            title="Or Upload Photo for Visual Heuristics"
            description="Our PIL image analyzer extracts RGB variance and aspect skew heuristics."
            action={<Badge variant="warning">Educational only</Badge>}
          >
            <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100/60 transition text-center p-6">
              <div className="rounded-full bg-emerald-600/10 p-3 text-emerald-600">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-base font-semibold">Upload skin photo for heuristic scan</p>
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
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-500/10 p-3 text-amber-800 border border-amber-500/20">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs">
                This feature is for educational risk triage. Always consult an in-person dermatologist.
              </p>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Clinical Assessment Results"
          description="Confidence-ranked heuristic observations and triage recommendations."
        >
          {analysisStatus === "analyzing" && (
            <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-800 animate-pulse">
              Running LightGBM tree evaluation...
            </div>
          )}
          {analysisStatus === "failed" && (
            <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-semibold text-red-700">
              Assessment failed. Please verify your inputs.
            </div>
          )}
          {!result ? (
            <div className="flex min-h-96 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 text-center p-8">
              <div className="rounded-full bg-emerald-600/10 p-4 text-emerald-600">
                <Camera className="h-8 w-8" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-slate-800">No assessment generated yet</p>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  Toggle your ABCDE checklist items or upload a photo to generate instantaneous gradient-boosted risk scores.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {result.risk_level && (
                <div className={`rounded-2xl p-5 border ${
                  result.risk_level.includes("High Risk") ? "bg-red-50 border-red-200 text-red-900" :
                  result.risk_level.includes("Moderate") ? "bg-amber-50 border-amber-200 text-amber-900" :
                  "bg-emerald-50 border-emerald-200 text-emerald-900"
                }`}>
                  <span className="text-xs font-extrabold uppercase tracking-widest block mb-1">Gradient-Boosted Triage Classification</span>
                  <h3 className="font-display text-2xl font-black">{result.risk_level}</h3>
                  {result.confidence && (
                    <p className="text-sm font-semibold mt-1">Model Confidence: {round(result.confidence * 100, 1)}%</p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Feature Importance Breakdown</p>
                {result.observations.map((observation) => (
                  <div
                    key={observation.label}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <p className="text-sm font-bold text-slate-800">{observation.label}</p>
                      <Badge className="bg-slate-900 text-white font-mono">{(observation.score * 100).toFixed(1)}%</Badge>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-600"
                        style={{ width: `${Math.min(100, observation.score * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl bg-slate-900 p-6 text-sm leading-6 text-white shadow-md">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">Clinical Recommendation</span>
                <p className="font-medium text-slate-200">{result.recommendation}</p>
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
