"use client";

import { useState } from "react";
import { MessageSquare, SendHorizonal } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askHealthAi } from "@/lib/api/healthguard";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend() {
    if (!prompt.trim()) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setPrompt("");
    setIsLoading(true);

    try {
      const response = await askHealthAi({ message: prompt, history: messages });
      setMessages([...nextMessages, { role: "assistant", content: response.reply }]);
    } catch {
      toast.error("Could not reach the AI service");
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "The AI service is unavailable right now. This screen is ready for the FastAPI chat integration.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">AI Companion</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask follow-up questions with your recent health history in context.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
        <SectionCard
          title="Suggested prompts"
          description="Good starting points for health literacy and appointment prep."
        >
          <div className="space-y-2.5 text-sm text-muted-foreground">
            <p>What patterns should I monitor in recurring headaches?</p>
            <p>How should I summarize the last week of fatigue for a doctor?</p>
            <p>Which details should I log next to improve pattern analysis?</p>
          </div>
        </SectionCard>

        <SectionCard
          title="Conversation"
          description="Recent symptom history can be included by the backend to make responses more relevant."
        >
          <div className="space-y-4">
            {!messages.length ? (
              <EmptyState
                icon={MessageSquare}
                title="No conversation yet"
                description="Start with a health question, a symptom follow-up, or a doctor-summary request."
              />
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg px-4 py-3 text-sm leading-6",
                        message.role === "user"
                          ? "bg-primary text-white"
                          : "border border-border bg-white text-foreground",
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
              <Textarea
                placeholder="Describe symptoms or ask a health question..."
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
              <Button className="w-full" onClick={handleSend} type="button" disabled={isLoading}>
                <SendHorizonal className="h-4 w-4" />
                {isLoading ? "Thinking..." : "Send message"}
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
