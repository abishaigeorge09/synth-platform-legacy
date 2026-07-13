/**
 * Per-instance ephemeral state for a rendered tool.
 *
 * `<ToolRenderer>` instantiates this hook with the resolved bindings as
 * the initial data. Buttons + inputs declared in the spec dispatch
 * actions that mutate this state — append rows to a target array, set
 * input values, reset.
 *
 * Sprint 5.6 — schema_version stays at 1; the dispatch verbs live here
 * (the spec's button.action.payload field is opaque per schema, so we
 * give it semantics in the renderer without bumping the schema).
 *
 * The state shape mirrors `ResolvedBindings` (a Record<string, unknown>)
 * with one reserved key `__inputs` for controlled input values.
 */
import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type Dispatch,
  type Reducer,
} from 'react'
import type { ResolvedBindings } from '@lib/tools/resolver'

export type ToolInstanceData = ResolvedBindings & {
  __inputs?: Record<string, unknown>
}

export type ToolAction =
  | { kind: 'append_row'; target: string; row: Record<string, unknown> }
  | { kind: 'set_input'; name: string; value: unknown }
  // Sprint 5.8 — toggle a string value in/out of a string[] under
  // `state[stateKey]`. Drives lineup_picker selection, which other
  // elements (boat_race) read from to stay in sync.
  | { kind: 'toggle_set_member'; stateKey: string; value: string }
  | { kind: 'reset' }

const reducer: Reducer<ToolInstanceData, ToolAction & { __initial?: ToolInstanceData }> = (
  state,
  action,
) => {
  switch (action.kind) {
    case 'append_row': {
      const current = state[action.target]
      const next = Array.isArray(current) ? [...current, action.row] : [action.row]
      return { ...state, [action.target]: next }
    }
    case 'set_input': {
      const inputs = (state.__inputs as Record<string, unknown> | undefined) ?? {}
      return { ...state, __inputs: { ...inputs, [action.name]: action.value } }
    }
    case 'toggle_set_member': {
      const current = state[action.stateKey]
      const set = Array.isArray(current)
        ? current.filter((v): v is string => typeof v === 'string')
        : []
      const next = set.includes(action.value)
        ? set.filter((v) => v !== action.value)
        : [...set, action.value]
      return { ...state, [action.stateKey]: next }
    }
    case 'reset':
      return action.__initial ?? state
    default:
      return state
  }
}

export function useToolInstanceState(initialBindings: ResolvedBindings) {
  const [data, rawDispatch] = useReducer(reducer, initialBindings as ToolInstanceData)

  const dispatch = useCallback<Dispatch<ToolAction>>(
    (action) => {
      if (action.kind === 'reset') {
        rawDispatch({ ...action, __initial: initialBindings as ToolInstanceData })
        return
      }
      rawDispatch(action)
    },
    [initialBindings],
  )

  return { data, dispatch }
}

// ─── Context plumbing ──────────────────────────────────────────────────────

export type ToolStateContextValue = {
  data: ToolInstanceData
  dispatch: Dispatch<ToolAction>
}

const NoopContext: ToolStateContextValue = {
  data: {},
  dispatch: () => {
    /* no provider — element renders without interactivity */
  },
}

export const ToolStateContext = createContext<ToolStateContextValue>(NoopContext)

export function useToolState(): ToolStateContextValue {
  return useContext(ToolStateContext)
}
