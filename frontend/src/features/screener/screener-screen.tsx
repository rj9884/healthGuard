"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { Camera, ShieldAlert, UploadCloud } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { classifyImage } from "@/lib/api/healthguard";
import { toast } from "sonner";

export function ScreenerScreen() {
  const [result, setResult] = useState<{
    observations: Array<{ label: string; score: number }>;
    recommendation: string;
  } | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "analyzing" | "completed" | "failed">("idle");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const saved = queryClient.getQueryData<{
      observations: Array<{ label: string; score: number }>;
      recommendation: string;
    }>(["screenerResult"]);

    if (saved) {
      setResult(saved);
      setAnalysisStatus("completed");
      return;
    }

    try {
      const persisted = window.localStorage.getItem("screenerResult");
      const status = window.localStorage.getItem("screenerStatus");

      if (status === "analyzing") {
        setAnalysisStatus("analyzing");
        toast("Image analysis is still running in the background.");
      }

      if (persisted) {
        setResult(JSON.parse(persisted));
        if (status === "completed") {
          setAnalysisStatus("completed");
        }
      }
    } catch {
      // ignore localStorage issues
    }
  }, [queryClient]);

  const classifyMutation = useMutation<{ observations: Array<{ label: string; score: number }>; recommendation: string }, unknown, File>({
    mutationFn: (file: File) => classifyImage(file),
    onMutate: () => {
      setAnalysisStatus("analyzing");
      setIsLoading(true);
      try {
        window.localStorage.setItem("screenerStatus", "analyzing");
      } catch {
        // ignore storage errors
      }
      toast("Analyzing image...", { icon: "⏳" });
    },
    onSuccess: (data) => {
      setResult(data);
      setAnalysisStatus("completed");
      queryClient.setQueryData(["screenerResult"], data);
      try {
        window.localStorage.setItem("screenerResult", JSON.stringify(data));
        window.localStorage.setItem("screenerStatus", "completed");
      } catch {
        // ignore storage errors
      }
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
        eyebrow="Screener"
        title="A product-grade upload and review experience for educational skin screening"
        description="This flow is deliberately framed as supportive and educational. It should feel polished without implying diagnosis."
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        <SectionCard
          title="Upload image"
          description="Select a clear, well-lit image for educational screening."
          action={<Badge variant="warning">Educational only</Badge>}
        >
          <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-muted/40 text-center">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <UploadCloud className="h-8 w-8" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">Drop or browse an image</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, WEBP supported</p>
            </div>
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={handleUpload}
            />
          </label>
          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-warning/10 p-4 text-warning">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-sm">
              This feature is for awareness and triage-style education. It is not a diagnosis.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="Results"
          description="Confidence-ranked observations and a care-oriented recommendation."
        >
          {analysisStatus === "analyzing" && (
            <div className="mb-4 rounded-2xl border border-primary/40 bg-primary/10 p-3 text-sm font-medium text-primary">
              Analysis is running in the background. You can continue navigating freely.
            </div>
          )}
          {analysisStatus === "failed" && (
            <div className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm font-medium text-destructive">
              Analysis failed. Try uploading again.
            </div>
          )}
          {!result ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-muted/30 text-center">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                <Camera className="h-8 w-8" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">No image reviewed yet</p>
                <p className="text-sm text-muted-foreground">
                  Once an image is selected, observations will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {result.observations.map((observation) => (
                <div
                  key={observation.label}
                  className="rounded-2xl border border-border bg-white px-4 py-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <p className="font-medium text-foreground">{observation.label}</p>
                    <Badge>{(observation.score * 100).toFixed(1)}%</Badge>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${observation.score * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="rounded-3xl bg-primary/10 p-5 text-sm leading-6 text-foreground">
                {result.recommendation}
              </div>
            </div>
          )}
          <Button className="mt-4 w-full" type="button" disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Ready for another upload"}
          </Button>
        </SectionCard>
      </div>
    </div>
  );
}
