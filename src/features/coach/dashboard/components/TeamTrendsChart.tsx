import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { THEME } from '../../../../lib/theme'
import { useMonthlyTrends } from '../../../../shared/data/queries'
import { SkeletonChart } from '../../../../shared/components/Skeleton'

/** Wrapper card that matches the dashboard surface style. */
function ChartCard({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="rounded-2xl border p-5"
      style={{
        background: THEME.white,
        borderColor: THEME.border,
        boxShadow: '0 1px 0 rgba(24,24,27,0.02), 0 20px 40px -28px rgba(24,24,27,0.2)',
      }}
    >
      <div
        className="text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: THEME.fontMono, color: THEME.textMuted }}
      >
        {kicker}
      </div>
      <div className="mt-1 text-[17px] font-semibold" style={{ color: THEME.textPrimary }}>
        {title}
      </div>
      <div className="mt-0.5 text-[11px]" style={{ color: THEME.textSecondary }}>
        {subtitle}
      </div>
      <div className="mt-4 h-[200px] w-full">{children}</div>
    </motion.div>
  )
}

export function TeamSessionsChart() {
  const { data: trends, isLoading, isError } = useMonthlyTrends()
  if (isError) return <SkeletonChart height={200} />
  if (isLoading) return <SkeletonChart height={200} />
  return (
    <ChartCard
      kicker="Signal · monthly"
      title="Sessions ingested"
      subtitle="Pieces · erg tests · water sessions synthesized from every connector"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={trends} margin={{ top: 8, right: 8, bottom: 4, left: -24 }}>
          <CartesianGrid stroke={THEME.border} vertical={false} strokeDasharray="2 4" />
          <XAxis
            dataKey="month"
            stroke={THEME.textMuted}
            tick={{ fontSize: 11, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={THEME.textMuted}
            tick={{ fontSize: 11, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(5,150,105,0.08)' }}
            contentStyle={{
              background: THEME.white,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              fontFamily: THEME.fontMono,
              fontSize: 11,
            }}
          />
          <Bar dataKey="sessions" fill={THEME.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function TeamComplianceChart() {
  const { data: trends, isLoading, isError } = useMonthlyTrends()
  if (isError) return <SkeletonChart height={200} />
  if (isLoading) return <SkeletonChart height={200} />
  return (
    <ChartCard
      kicker="Signal · compliance"
      title="Team compliance %"
      subtitle="Training adherence across the roster, rolled up from TeamWorks + wellness digests"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trends} margin={{ top: 8, right: 16, bottom: 4, left: -24 }}>
          <CartesianGrid stroke={THEME.border} vertical={false} strokeDasharray="2 4" />
          <XAxis
            dataKey="month"
            stroke={THEME.textMuted}
            tick={{ fontSize: 11, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[70, 100]}
            stroke={THEME.textMuted}
            tick={{ fontSize: 11, fontFamily: THEME.fontMono, fill: THEME.textMuted }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: THEME.white,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              fontFamily: THEME.fontMono,
              fontSize: 11,
            }}
            formatter={(v) => [`${v}%`, 'Compliance']}
          />
          <Line
            type="monotone"
            dataKey="compliancePct"
            stroke={THEME.accent}
            strokeWidth={2.5}
            dot={{ fill: THEME.accent, stroke: THEME.white, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
