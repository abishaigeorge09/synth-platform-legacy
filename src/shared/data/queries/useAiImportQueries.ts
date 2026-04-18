import { SEED_AI_IMPORT_JOBS } from '../seeds'
import { useStaticQuery } from './useStaticQuery'

export function useAiImportJobs() {
  return useStaticQuery(SEED_AI_IMPORT_JOBS)
}
