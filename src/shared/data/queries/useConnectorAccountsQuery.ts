import { SEED_CONNECTOR_ACCOUNTS } from '@shared/data/seeds'
import { useStaticQuery } from '@shared/data/queries/useStaticQuery'

export function useConnectorAccounts() {
  return useStaticQuery(SEED_CONNECTOR_ACCOUNTS)
}
