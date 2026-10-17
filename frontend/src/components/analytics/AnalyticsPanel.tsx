import { useQuery } from '@tanstack/react-query'

import CostBreakdownChart from './CostBreakdownChart'
import LapProgressionChart from './LapProgressionChart'
import PowerProgressionChart from './PowerProgressionChart'
import StatTile from '../ui/StatTile'
import StockVsCurrent from './StockVsCurrent'
import { api } from '../../lib/api'
import { formatLapTime } from '../../lib/format'
import type { CarAnalytics } from '../../lib/types'

export default function AnalyticsPanel({ carId }: { carId: string }) {
  const analyticsQuery = useQuery({
    queryKey: ['analytics', carId],
    queryFn: async () => {
      const response = await api.get<CarAnalytics>(`/cars/${carId}/analytics`)
      return response.data
    },
  })

  if (analyticsQuery.isLoading) {
    return (
      <p className='font-mono text-sm text-slate-500'>
        Crunching the numbers...
      </p>
    )
  }

  if (analyticsQuery.isError || !analyticsQuery.data) {
    return (
      <div className='panel border-red-900/50 p-6'>
        <p className='text-sm text-red-400'>Could not load analytics.</p>
      </div>
    )
  }

  const {
    best_stats,
    stock_vs_current,
    cost_analysis,
    power_progression,
    lap_progression,
  } = analyticsQuery.data

  return (
    <div className='space-y-6'>
      {/* Best stats */}
      <section className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
        <StatTile
          label='Best HP'
          value={
            best_stats.best_hp ? String(Math.round(best_stats.best_hp)) : '—'
          }
          unit='hp'
          accent
        />

        <StatTile
          label='Best torque'
          value={
            best_stats.best_torque
              ? String(Math.round(best_stats.best_torque))
              : '—'
          }
          unit='lb-ft'
        />

        <StatTile
          label='Best 0–60'
          value={
            best_stats.best_zero_to_sixty
              ? best_stats.best_zero_to_sixty.toFixed(2)
              : '—'
          }
          unit='sec'
        />

        <StatTile
          label='Best 1/4 mile'
          value={
            best_stats.best_quarter_mile
              ? best_stats.best_quarter_mile.toFixed(2)
              : '—'
          }
          unit='sec'
        />

        <StatTile
          label='Best lap'
          value={best_stats.best_lap ? formatLapTime(best_stats.best_lap) : '—'}
        />

        <StatTile
          label='Best 60–0'
          value={
            best_stats.best_braking ? best_stats.best_braking.toFixed(1) : '—'
          }
          unit='ft'
        />
      </section>

      {/* Stock vs current */}
      <StockVsCurrent data={stock_vs_current} />

      {/* Cost summary */}
      <section className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <StatTile label='Total mods' value={String(cost_analysis.mod_count)} />

        <StatTile
          label='Total invested'
          value={
            cost_analysis.total_cost > 0
              ? `$${cost_analysis.total_cost.toLocaleString()}`
              : '—'
          }
          accent
        />

        <StatTile
          label='Est. HP gain'
          value={
            cost_analysis.total_estimated_hp_gain > 0
              ? `+${cost_analysis.total_estimated_hp_gain}`
              : '—'
          }
          unit={cost_analysis.total_estimated_hp_gain > 0 ? 'hp' : undefined}
        />

        <StatTile
          label='Cost per HP'
          value={
            cost_analysis.cost_per_hp
              ? `$${cost_analysis.cost_per_hp.toFixed(0)}`
              : '—'
          }
          hint='Lower is better'
        />
      </section>

      {/* Charts */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <PowerProgressionChart data={power_progression} />
        <CostBreakdownChart data={cost_analysis.by_category} />
      </div>

      <LapProgressionChart data={lap_progression} />
    </div>
  )
}
