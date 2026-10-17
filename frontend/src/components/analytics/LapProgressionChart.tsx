import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { CHART_THEME, axisStyle, tooltipStyle } from './chartTheme'
import ChartPanel from './ChartPanel'
import { formatLapTime } from '../../lib/format'
import type { LapProgressionPoint } from '../../lib/types'

const TRACK_COLORS = [
  CHART_THEME.primary,
  CHART_THEME.secondary,
  CHART_THEME.tertiary,
  '#34d399',
  '#f472b6',
]

function formatDate(iso: string): string {
  const d = new Date(iso)

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function LapProgressionChart({
  data,
}: {
  data: Record<string, LapProgressionPoint[]>
}) {
  const tracks = Object.keys(data)
  const hasData = tracks.length > 0

  // Merge all tracks into a unified timeline for the X axis
  const allDates = Array.from(
    new Set(tracks.flatMap(track => data[track].map(p => p.date))),
  ).sort()

  const chartData = allDates.map(date => {
    const row: Record<string, string | number | null> = {
      dateLabel: formatDate(date),
    }

    for (const track of tracks) {
      const point = data[track].find(p => p.date === date)
      row[track] = point ? point.lap_time : null
    }

    return row
  })

  return (
    <ChartPanel
      title='Lap time progression'
      subtitle='Lower is better — one line per track'
      emptyMessage='Log a track session with a lap time to see improvement.'
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
              reversed
              domain={['dataMin - 2', 'dataMax + 2']}
              label={{
                value: 'seconds',
                angle: -90,
                position: 'insideLeft',
                fill: CHART_THEME.axis,
                fontSize: 11,
              }}
            />

            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: CHART_THEME.text, fontWeight: 600 }}
              formatter={(value: number) => [formatLapTime(value)]}
            />

            <Legend
              wrapperStyle={{ fontSize: '11px', color: CHART_THEME.text }}
            />

            {tracks.map((track, index) => (
              <Line
                key={track}
                type='monotone'
                dataKey={track}
                stroke={TRACK_COLORS[index % TRACK_COLORS.length]}
                strokeWidth={2}
                connectNulls
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={track}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  )
}
