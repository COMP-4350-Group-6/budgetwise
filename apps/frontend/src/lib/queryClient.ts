import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

// Singleton QueryClient so that the cache is shared across the app lifecycle
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours (formerly cacheTime in v4)
      refetchOnWindowFocus: false,
    },
  },
});

// Persister stores the cache in localStorage (sync, trivial)
export const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
});

// Exporting options for the PersistQueryClientProvider
export const persistOptions: PersistQueryClientOptions = {
  queryClient,
  persister,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};
