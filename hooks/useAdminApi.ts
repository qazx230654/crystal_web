"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type AdminApiOptions = {
  initialLoading?: boolean;
  nextPath: string;
};

type AdminApiRequestOptions = {
  errorMessage?: string;
  loading?: boolean;
  successMessage?: string;
};

type ErrorPayload = {
  error?: {
    message?: string;
  };
};

export function useAdminApi({ initialLoading = false, nextPath }: AdminApiOptions) {
  const router = useRouter();
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const retryRef = useRef<(() => Promise<unknown>) | null>(null);

  const request = useCallback(
    async <T,>(url: string, init?: RequestInit, options: AdminApiRequestOptions = {}) => {
      const shouldSetLoading = options.loading ?? true;

      async function execute() {
        if (shouldSetLoading) setLoading(true);
        setError(null);
        if (options.successMessage) setToast(null);

        try {
          const response = await fetch(url, init);
          const payload = (await response.json().catch(() => null)) as T | ErrorPayload | null;

          if (response.status === 401) {
            router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
            return null;
          }

          if (!response.ok) {
            const message = getPayloadErrorMessage(payload) ?? options.errorMessage ?? "操作失敗，請稍後再試";
            setError(message);
            return null;
          }

          if (options.successMessage) setToast(options.successMessage);
          return payload as T;
        } catch (requestError) {
          const message = requestError instanceof Error ? requestError.message : options.errorMessage ?? "操作失敗，請稍後再試";
          setError(message);
          return null;
        } finally {
          if (shouldSetLoading) setLoading(false);
        }
      }

      retryRef.current = execute;
      return execute();
    },
    [nextPath, router]
  );

  const retry = useCallback(async () => {
    return retryRef.current?.() ?? null;
  }, []);

  return {
    clearToast: () => setToast(null),
    error,
    loading,
    request,
    retry,
    setError,
    setLoading,
    setToast,
    toast
  };
}

function getPayloadErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("error" in payload)) return null;
  const error = (payload as ErrorPayload).error;
  return error?.message ?? null;
}
