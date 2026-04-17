import { useState, useEffect, useCallback } from "react";
import { useGetProgress, useMarkChapterComplete, useUnmarkChapterComplete } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const SESSION_KEY = "cbse_session_id";

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useProgress() {
  const [sessionId] = useState<string>(getOrCreateSessionId);
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetProgress(
    { sessionId },
    { query: { staleTime: 0 } }
  );

  const completedIds = new Set<number>(data?.completedChapterIds ?? []);

  const markMutation = useMarkChapterComplete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["getProgress"] });
      },
    },
  });

  const unmarkMutation = useUnmarkChapterComplete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["getProgress"] });
      },
    },
  });

  const markComplete = useCallback(
    (chapterId: number) => {
      markMutation.mutate({ data: { sessionId, chapterId } });
    },
    [sessionId, markMutation]
  );

  const unmarkComplete = useCallback(
    (chapterId: number) => {
      unmarkMutation.mutate({ chapterId, params: { sessionId } });
    },
    [sessionId, unmarkMutation]
  );

  const toggleComplete = useCallback(
    (chapterId: number) => {
      if (completedIds.has(chapterId)) {
        unmarkComplete(chapterId);
      } else {
        markComplete(chapterId);
      }
    },
    [completedIds, markComplete, unmarkComplete]
  );

  return {
    completedIds,
    isLoading,
    markComplete,
    unmarkComplete,
    toggleComplete,
    isMarkingComplete: markMutation.isPending,
    isUnmarking: unmarkMutation.isPending,
  };
}
