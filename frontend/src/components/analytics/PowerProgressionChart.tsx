import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { CHART_THEME, axisStyle, tooltipStyle } from './chartTheme'
import ChartPanel from './ChartPanel'
import type { PowerProgressionPoint } from '../../lib/types'

function formatDate(iso: string): string {
  const d = new Date(iso)

  return d.toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  })
}

export default function PowerProgressionChart({
  data,
}: {
  data: PowerProgressionPoint[]
}) {
  const hasData = data.length > 0

  const dynoPoints = data.filter(p => p.point_type === 'dyno')

  const chartData = data.map(point => ({
    ...point,
    dateLabel: formatDate(point.date),
  }))

  return (
    <ChartPanel
      title='Power progression'
      subtitle='Stock → mods → dyno verification'
      emptyMessage='Add a baseline HP and log a dyno session to see your power curve.'
      hasData={hasData}
    >
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray='3 3'
              stroke={CHART_THEME.grid}
              vertical={false}
            />

            <XAxis
              dataKey='dateLabel'
              tick={axisStyle}
              stroke={CHART_THEME.grid}
            />

            <YAxis
              tick={axisStyle}
              stroke={CHART_THEME.grid}
              label={{
                value: 'hp',
                angle: -90,
                position: 'insideLeft',
                fill: CHART_THEME.axis,
                fontSize: 11,
              }}
            />

            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: CHART_THEME.text, fontWeight: 600 }}
              formatter={(value: number, _name: string, props: any) => [
                `${value} hp`,
                props.payload.label,
              ]}
            />

            <Legend
              wrapperStyle={{ fontSize: '11px', color: CHART_THEME.text }}
            />

            <Line
              type='monotone'
              dataKey='hp'
              stroke={CHART_THEME.primary}
              strokeWidth={2}
              dot={{
                fill: CHART_THEME.primary,
                r: 4,
              }}
              activeDot={{ r: 6 }}
              name='Estimated HP'
            />

            {dynoPoints.map(point => (
              <ReferenceDot
                key={`dyno-${point.date}`}
                x={formatDate(point.date)}
                y={point.hp}
                r={8}
                fill={CHART_THEME.secondary}
                stroke={CHART_THEME.tooltip.bg}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className='mt-4 flex flex-wrap gap-4 text-xs'>
        <div className='flex items-center gap-2'>
          <span
            className='inline-block h-2 w-2 rounded-full'
            style={{ background: CHART_THEME.primary }}
          />
          <span className='text-slate-400'>Estimated HP (mods)</span>
        </div>

        <div className='flex items-center gap-2'>
          <span
            className='inline-block h-2 w-2 rounded-full'
            style={{ background: CHART_THEME.secondary }}
          />
          <span className='text-slate-400'>Dyno verified</span>
        </div>
      </div>
    </ChartPanel>
  )
}
