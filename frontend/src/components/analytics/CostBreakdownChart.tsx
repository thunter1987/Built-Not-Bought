import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { CHART_THEME, axisStyle, tooltipStyle } from './chartTheme'
import ChartPanel from './ChartPanel'
import { humanizeCategory } from '../../lib/constants'
import type { CostCategoryBreakdown } from '../../lib/types'

const BAR_COLORS = [
  CHART_THEME.primary,
  CHART_THEME.secondary,
  CHART_THEME.tertiary,
  '#34d399',
  '#f472b6',
  '#fbbf24',
]

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`
}

export default function CostBreakdownChart({
  data,
}: {
  data: CostCategoryBreakdown[]
}) {
  const hasData = data.length > 0

  const chartData = data
    .filter(d => d.cost > 0)
    .map(d => ({
      category: humanizeCategory(d.category),
      cost: d.cost,
      count: d.count,
      hp_gain: d.hp_gain,
    }))

  return (
    <ChartPanel
      title='Investment by category'
      subtitle='Where the money went'
      emptyMessage='Add modifications with costs to see the breakdown.'
      hasData={hasData}
    >
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={chartData}
            layout='vertical'
            margin={{ top: 10, right: 20, bottom: 10, left: 80 }}
          >
            <CartesianGrid
              strokeDasharray='3 3'
              stroke={CHART_THEME.grid}
              horizontal={false}
            />

            <XAxis
              type='number'
              tick={axisStyle}
              stroke={CHART_THEME.grid}
              tickFormatter={value => `$${value}`}
            />

            <YAxis
              type='category'
              dataKey='category'
              tick={axisStyle}
              stroke={CHART_THEME.grid}
              width={80}
            />

            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: CHART_THEME.text, fontWeight: 600 }}
              formatter={(value: number, _name: string, props: any) => [
                formatCurrency(value),
                `${props.payload.category} (${props.payload.count} mod${
                  props.payload.count === 1 ? '' : 's'
                })`,
              ]}
            />

            <Bar dataKey='cost' radius={[0, 4, 4, 0]}>
              {chartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartPanel>
  )
}
