import { SEED_AI_IMPORT_JOBS } from '@shared/data/seeds'
import { useStaticQuery } from '@shared/data/queries/useStaticQuery'

export function useAiImportJobs() {
  return useStaticQuery(SEED_AI_IMPORT_JOBS)
}
