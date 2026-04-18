import { SEED_CONNECTOR_ACCOUNTS } from '../seeds'
import { useStaticQuery } from './useStaticQuery'

export function useConnectorAccounts() {
  return useStaticQuery(SEED_CONNECTOR_ACCOUNTS)
}
