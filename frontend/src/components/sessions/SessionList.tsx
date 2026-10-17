import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import SessionCard from './SessionCard'
import SessionForm from './SessionForm'
import StatTile from '../ui/StatTile'
import { api } from '../../lib/api'
import { formatLapTime } from '../../lib/format'
import { getBestSessions } from '../../lib/sessionHelpers'
import type { PerformanceLog, PerformanceLogPayload } from '../../lib/types'

export default function SessionList({ carId }: { carId: string }) {
  const queryClient = useQueryClient()

  const [adding, setAdding] = useState(false)
  const [editingLog, setEditingLog] = useState<PerformanceLog | null>(null)

  const logsQuery = useQuery({
    queryKey: ['performance-logs', carId],
    queryFn: async () => {
      const response = await api.get<PerformanceLog[]>(`/cars/${carId}/logs`)
      return response.data
    },
  })

  const createLog = useMutation({
    mutationFn: async (payload: PerformanceLogPayload) => {
      const response = await api.post<PerformanceLog>(
        `/cars/${carId}/logs`,
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['performance-logs', carId],
      })
      setAdding(false)
    },
  })

  const updateLog = useMutation({
    mutationFn: async ({
      logId,
      payload,
    }: {
      logId: string
      payload: PerformanceLogPayload
    }) => {
      const response = await api.patch<PerformanceLog>(
        `/cars/${carId}/logs/${logId}`,
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['performance-logs', carId],
      })
      setEditingLog(null)
    },
  })

  const deleteLog = useMutation({
    mutationFn: async (logId: string) => {
      await api.delete(`/cars/${carId}/logs/${logId}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['performance-logs', carId],
      })
    },
  })

  const logs = logsQuery.data ?? []
  const best = getBestSessions(logs)

  return (
    <div>
      {/* Best stats */}
      <section className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
        <StatTile
          label='Best HP'
          value={best.bestHp?.horsepower ? String(best.bestHp.horsepower) : '—'}
          unit='hp'
          accent
        />

        <StatTile
          label='Best 0–60'
          value={
            best.bestZeroToSixty?.zero_to_sixty_sec
              ? best.bestZeroToSixty.zero_to_sixty_sec.toFixed(2)
              : '—'
          }
          unit='sec'
        />

        <StatTile
          label='Best 1/4 mile'
          value={
            best.bestQuarterMile?.quarter_mile_sec
              ? best.bestQuarterMile.quarter_mile_sec.toFixed(2)
              : '—'
          }
          unit={
            best.bestQuarterMile?.quarter_mile_mph
              ? `@ ${best.bestQuarterMile.quarter_mile_mph} mph`
              : undefined
          }
        />

        <StatTile
          label='Best lap'
          value={
            best.bestLap?.lap_time_sec
              ? formatLapTime(best.bestLap.lap_time_sec)
              : '—'
          }
        />

        <StatTile
          label='Best braking'
          value={
            best.bestBraking?.sixty_to_zero_ft
              ? best.bestBraking.sixty_to_zero_ft.toFixed(1)
              : '—'
          }
          unit='ft'
        />
      </section>

      {/* Actions */}
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
        <h2 className='font-display text-2xl font-semibold uppercase text-white'>
          Performance sessions
        </h2>

        <button
          className='btn btn-primary'
          onClick={() => {
            setAdding(true)
            setEditingLog(null)
          }}
        >
          + Log session
        </button>
      </div>

      {/* Add form */}
      {adding ? (
        <div className='panel mb-6 p-6'>
          <SessionForm
            submitLabel='Log this session'
            onCancel={() => setAdding(false)}
            onSubmit={async payload => {
              await createLog.mutateAsync(payload)
            }}
          />
        </div>
      ) : null}

      {/* Edit form */}
      {editingLog ? (
        <div className='panel mb-6 p-6'>
          <SessionForm
            initial={editingLog}
            submitLabel='Save changes'
            onCancel={() => setEditingLog(null)}
            onSubmit={async payload => {
              await updateLog.mutateAsync({
                logId: editingLog.id,
                payload,
              })
            }}
          />
        </div>
      ) : null}

      {/* Loading */}
      {logsQuery.isLoading ? (
        <p className='font-mono text-sm text-slate-500'>Loading sessions...</p>
      ) : null}

      {/* Error */}
      {logsQuery.isError ? (
        <div className='panel border-red-900/50 p-6'>
          <p className='text-sm text-red-400'>Could not load sessions.</p>
        </div>
      ) : null}

      {/* Empty state */}
      {logs.length === 0 && !adding ? (
        <div className='panel p-10 text-center'>
          <p className='font-display text-2xl uppercase text-slate-300'>
            No sessions logged yet.
          </p>
          <p className='mt-2 text-sm text-slate-500'>
            Time to prove the build. Log your first dyno, track day, or drag
            pass.
          </p>
        </div>
      ) : null}

      {/* Session list */}
      {logs.length > 0 ? (
        <div className='grid gap-4 md:grid-cols-2'>
          {logs.map(log => (
            <SessionCard
              key={log.id}
              log={log}
              onEdit={() => {
                setEditingLog(log)
                setAdding(false)
              }}
              onDelete={() => {
                const confirmed = window.confirm('Delete this session?')

                if (confirmed) {
                  deleteLog.mutate(log.id)
                }
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
