"use client";

import { useEffect, useRef } from "react";
import { useBanKaiStore } from "@/lib/store";
import { WorkflowEvent } from "@/types";

export function useSSE(projectId?: string) {
  const addLiveEvent = useBanKaiStore((state) => state.addLiveEvent);
  const setIsConnectedSSE = useBanKaiStore((state) => state.setIsConnectedSSE);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const sseUrl = `${apiBase}/api/v1/events/stream?project_id=${projectId}`;

    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnectedSSE(true);
    };

    es.onerror = () => {
      setIsConnectedSSE(false);
    };

    // Listen to standard agent events
    const eventTypes = [
      "agent.started",
      "agent.progress",
      "agent.completed",
      "agent.failed",
      "research.source_found",
      "research.claim_extracted",
      "verification.completed",
      "approval.required",
      "execution.started",
      "execution.completed",
      "workflow.completed",
      "workflow.failed",
    ];

    eventTypes.forEach((eventType) => {
      es.addEventListener(eventType, (e: MessageEvent) => {
        try {
          const parsed: WorkflowEvent = JSON.parse(e.data);
          addLiveEvent(parsed);
        } catch (err) {
          console.error("Error parsing SSE event:", err);
        }
      });
    });

    return () => {
      es.close();
      setIsConnectedSSE(false);
    };
  }, [projectId, addLiveEvent, setIsConnectedSSE]);
}
