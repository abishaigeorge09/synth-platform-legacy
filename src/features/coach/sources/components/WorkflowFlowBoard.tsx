import { memo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { THEME } from '../../../../lib/theme'

const NODE_W = 220
const NODE_H = 74

type NodeKind = 'source' | 'processing' | 'output'

type WNode = { id: string; label: string; kind: NodeKind; color?: string; x: number; y: number; detail: string }

const INITIAL_NODES: WNode[] = [
  { id: 'google-sheets', label: 'Google Sheets', kind: 'source', color: '#34A853', x: 24, y: 20, detail: '2,847 records · 64/64 · 1h ago' },
  { id: 'concept2', label: 'Concept2', kind: 'source', color: '#1A1A2E', x: 24, y: 114, detail: '1,204 records · 41/64 · 3h ago' },
  { id: 'strava', label: 'Strava', kind: 'source', color: '#FC4C02', x: 24, y: 208, detail: '892 records · 38/64 · 30m ago' },
  { id: 'apple-health', label: 'Apple Health', kind: 'source', color: '#FF2D55', x: 24, y: 302, detail: '1,640 records · 52/64 · 2h ago' },
  { id: 'whoop', label: 'Whoop', kind: 'source', color: '#00F19F', x: 24, y: 396, detail: '1,482 records · 47/64 · 55m ago' },
  { id: 'bridge', label: 'Bridge', kind: 'source', color: '#4A90D9', x: 24, y: 490, detail: '1,890 records · 54/64 · 1d ago' },
  { id: 'trainingpeaks', label: 'TrainingPeaks', kind: 'source', color: '#FFD700', x: 24, y: 584, detail: '3,200 records · 28/64 · 4h ago' },
  { id: 'google-calendar', label: 'Google Calendar', kind: 'source', color: '#4285F4', x: 24, y: 678, detail: '420 records · 64/64 · 12m ago' },
  { id: 'garmin', label: 'Garmin', kind: 'source', color: '#007CC3', x: 24, y: 772, detail: '980 records · 22/64 · 5h ago' },
  { id: 'oura', label: 'Oura', kind: 'source', color: '#C0C0C0', x: 24, y: 866, detail: '720 records · 18/64 · 8h ago' },
  { id: 'coach-notes', label: 'Coach Notes', kind: 'source', color: '#8B5CF6', x: 24, y: 960, detail: '47 notes · 2h ago' },
  { id: 'ai-import', label: 'AI Import', kind: 'source', color: '#8B5CF6', x: 24, y: 1054, detail: '156 imports · 1d ago' },
  { id: 'name-matching', label: 'Name Matching', kind: 'processing', x: 460, y: 180, detail: '64/64 athletes matched' },
  { id: 'normalization', label: 'Data Normalization', kind: 'processing', x: 460, y: 380, detail: 'Units + dedupe + conflict resolve' },
  { id: 'synthesis', label: 'Synthesis Engine', kind: 'processing', x: 460, y: 580, detail: 'Composite scoring + detection' },
  { id: 'athlete-profiles', label: 'Athlete Profiles', kind: 'output', x: 900, y: 120, detail: '64 synthesized timelines' },
  { id: 'training-load', label: 'Training Load', kind: 'output', x: 900, y: 240, detail: 'Composite 0-10 scoring' },
  { id: 'recovery', label: 'Recovery Readiness', kind: 'output', x: 900, y: 360, detail: 'Sleep + HRV + wellness' },
  { id: 'injury-risk', label: 'Injury Risk', kind: 'output', x: 900, y: 480, detail: 'Multi-signal risk detection' },
  { id: 'dashboard', label: 'Coach Dashboard', kind: 'output', x: 900, y: 600, detail: 'Alerts and weekly digest' },
  { id: 'synth-ai', label: 'synth. AI', kind: 'output', x: 900, y: 720, detail: 'Natural language querying' },
]

const INITIAL_EDGES: Array<{ id: string; from: string; to: string; label: string; color: string }> = [
  { id: 'e1', from: 'google-sheets', to: 'name-matching', label: 'athlete names + erg', color: '#34A853' },
  { id: 'e2', from: 'concept2', to: 'name-matching', label: 'logbook records', color: '#1A1A2E' },
  { id: 'e3', from: 'strava', to: 'name-matching', label: 'activities', color: '#FC4C02' },
  { id: 'e4', from: 'bridge', to: 'name-matching', label: 'gym sessions', color: '#4A90D9' },
  { id: 'e5', from: 'apple-health', to: 'normalization', label: 'sleep + HRV', color: '#FF2D55' },
  { id: 'e6', from: 'whoop', to: 'normalization', label: 'recovery + strain', color: '#00F19F' },
  { id: 'e7', from: 'trainingpeaks', to: 'normalization', label: 'TSS/CTL/ATL', color: '#FFD700' },
  { id: 'e8', from: 'google-calendar', to: 'normalization', label: 'schedule', color: '#4285F4' },
  { id: 'e9', from: 'garmin', to: 'normalization', label: 'body battery', color: '#007CC3' },
  { id: 'e10', from: 'oura', to: 'normalization', label: 'readiness + temp', color: '#C0C0C0' },
  { id: 'e11', from: 'coach-notes', to: 'normalization', label: 'transcriptions', color: '#8B5CF6' },
  { id: 'e12', from: 'ai-import', to: 'normalization', label: 'extracted events', color: '#8B5CF6' },
  { id: 'e13', from: 'name-matching', to: 'synthesis', label: 'identity map', color: THEME.primary },
  { id: 'e14', from: 'normalization', to: 'synthesis', label: 'clean timeline', color: THEME.primary },
  { id: 'e15', from: 'synthesis', to: 'athlete-profiles', label: 'profile generation', color: THEME.primary },
  { id: 'e16', from: 'synthesis', to: 'training-load', label: 'load scoring', color: THEME.primary },
  { id: 'e17', from: 'synthesis', to: 'recovery', label: 'recovery model', color: THEME.primary },
  { id: 'e18', from: 'synthesis', to: 'injury-risk', label: 'risk model', color: THEME.primary },
  { id: 'e19', from: 'synthesis', to: 'dashboard', label: 'alerts', color: THEME.primary },
  { id: 'e20', from: 'synthesis', to: 'synth-ai', label: 'context graph', color: THEME.primary },
]

function toFlowNodes(): Node[] {
  return INITIAL_NODES.map((n) => ({
    id: n.id,
    type: 'synth',
    position: { x: n.x, y: n.y },
    data: { label: n.label, detail: n.detail, kind: n.kind, color: n.color },
  }))
}

function toFlowEdges(): Edge[] {
  return INITIAL_EDGES.map((e) => ({
    id: e.id,
    source: e.from,
    target: e.to,
    label: e.label,
    animated: true,
    style: { stroke: e.color, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: e.color, width: 16, height: 16 },
  }))
}

const CustomNode = memo(function CustomNode({ data }: NodeProps) {
  const d = data as { label: string; detail: string; kind: NodeKind; color?: string }
  return (
    <div
      className="rounded-lg border bg-white px-2 py-1.5"
      style={{
        width: NODE_W,
        minHeight: NODE_H,
        borderStyle: d.kind === 'processing' ? 'dashed' : 'solid',
        borderColor: d.kind === 'output' ? THEME.primary : THEME.border,
        borderLeftWidth: d.kind === 'source' ? 3 : 1,
        borderLeftColor: d.kind === 'source' ? d.color ?? THEME.primary : THEME.border,
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2" style={{ fontFamily: THEME.fontMono, fontWeight: 700, color: THEME.textPrimary }}>
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{
            background:
              d.kind === 'processing' ? THEME.amber : d.kind === 'output' ? THEME.primary : d.color ?? THEME.primary,
            opacity: d.kind === 'processing' ? 0.85 : 1,
          }}
          aria-hidden
        />
        {d.label}
      </div>
      <div className="mt-1 text-[10px] leading-snug" style={{ color: THEME.textSecondary }}>
        {d.detail}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
})

const nodeTypes = { synth: CustomNode }

export function WorkflowFlowBoard() {
  const [nodes, , onNodesChange] = useNodesState(toFlowNodes())
  const [edges, , onEdgesChange] = useEdgesState(toFlowEdges())

  return (
    <div className="rounded-lg border" style={{ borderColor: THEME.border, background: THEME.white, height: 'calc(70vh - 80px)', minHeight: 520 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.25}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ animated: true }}
      >
        <Controls showInteractive={false} />
        <Background gap={20} color={THEME.border} />
      </ReactFlow>
    </div>
  )
}
