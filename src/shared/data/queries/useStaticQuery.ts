/**
 * Lightweight shim matching the TanStack Query `UseQueryResult` shape.
 *
 * Every hook in this directory returns this shape today with seed data
 * resolved synchronously (isLoading: false, error: null). When
 * `@tanstack/react-query` is installed:
 *
 *   1. Replace this file with a re-export of `useQuery` from the library.
 *   2. Swap each hook's body from `useStaticQuery(SEED_X)` to
 *      `useQuery({ queryKey: [...], queryFn: () => supabase.from(...) })`.
 *   3. Add `<QueryClientProvider>` in App.tsx.
 *
 * The consumer API (`const { data } = useTeam()`) stays identical.
 */

export type StaticQueryResult<T> = {
  data: T
  isLoading: boolean
  isError: boolean
  error: Error | null
}

export function useStaticQuery<T>(data: T): StaticQueryResult<T> {
  return { data, isLoading: false, isError: false, error: null }
}
