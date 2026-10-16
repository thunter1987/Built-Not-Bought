import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import ModCard from './ModCard'
import ModForm from './ModForm'
import StatTile from '../ui/StatTile'
import { api } from '../../lib/api'
import {
  calculateCostPerHorsepower,
  calculateEstimatedHpGain,
  calculateTotalCost,
  groupModificationsByCategory,
} from '../../lib/calculations'
import { humanizeCategory } from '../../lib/constants'
import type { Modification, ModificationPayload } from '../../lib/types'

export default function BuildSheet({ carId }: { carId: string }) {
  const queryClient = useQueryClient()

  const [adding, setAdding] = useState(false)
  const [editingMod, setEditingMod] = useState<Modification | null>(null)

  const modsQuery = useQuery({
    queryKey: ['modifications', carId],
    queryFn: async () => {
      const response = await api.get<Modification[]>(
        `/cars/${carId}/modifications`,
      )
      return response.data
    },
  })

  const createMod = useMutation({
    mutationFn: async (payload: ModificationPayload) => {
      const response = await api.post<Modification>(
        `/cars/${carId}/modifications`,
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['modifications', carId],
      })
      setAdding(false)
    },
  })

  const updateMod = useMutation({
    mutationFn: async ({
      modId,
      payload,
    }: {
      modId: string
      payload: ModificationPayload
    }) => {
      const response = await api.patch<Modification>(
        `/cars/${carId}/modifications/${modId}`,
        payload,
      )
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['modifications', carId],
      })
      setEditingMod(null)
    },
  })

  const deleteMod = useMutation({
    mutationFn: async (modId: string) => {
      await api.delete(`/cars/${carId}/modifications/${modId}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['modifications', carId],
      })
    },
  })

  const modifications = modsQuery.data ?? []
  const totalCost = calculateTotalCost(modifications)
  const totalHpGain = calculateEstimatedHpGain(modifications)
  const costPerHp = calculateCostPerHorsepower(totalCost, totalHpGain)
  const grouped = groupModificationsByCategory(modifications)

  return (
    <div>
      {/* Analytics */}
      <section className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
        <StatTile label='Total mods' value={String(modifications.length)} />

        <StatTile
          label='Total cost'
          value={totalCost > 0 ? `$${totalCost.toLocaleString()}` : '—'}
          accent
        />

        <StatTile
          label='Est. HP gain'
          value={totalHpGain > 0 ? `+${totalHpGain}` : '—'}
          unit={totalHpGain > 0 ? 'hp' : undefined}
        />

        <StatTile
          label='Cost per HP'
          value={costPerHp ? `$${costPerHp.toFixed(0)}` : '—'}
          hint='Lower is better'
        />
      </section>

      {/* Actions */}
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
        <h2 className='font-display text-2xl font-semibold uppercase text-white'>
          Build sheet
        </h2>

        <button
          className='btn btn-primary'
          onClick={() => {
            setAdding(true)
            setEditingMod(null)
          }}
        >
          + Add mod
        </button>
      </div>

      {/* Add form */}
      {adding ? (
        <div className='panel mb-6 p-6'>
          <ModForm
            submitLabel='Add to build'
            onCancel={() => setAdding(false)}
            onSubmit={async payload => {
              await createMod.mutateAsync(payload)
            }}
          />
        </div>
      ) : null}

      {/* Edit form */}
      {editingMod ? (
        <div className='panel mb-6 p-6'>
          <ModForm
            initial={editingMod}
            submitLabel='Save changes'
            onCancel={() => setEditingMod(null)}
            onSubmit={async payload => {
              await updateMod.mutateAsync({
                modId: editingMod.id,
                payload,
              })
            }}
          />
        </div>
      ) : null}

      {/* Loading */}
      {modsQuery.isLoading ? (
        <p className='font-mono text-sm text-slate-500'>
          Loading build sheet...
        </p>
      ) : null}

      {/* Error */}
      {modsQuery.isError ? (
        <div className='panel border-red-900/50 p-6'>
          <p className='text-sm text-red-400'>Could not load modifications.</p>
        </div>
      ) : null}

      {/* Empty state */}
      {modifications.length === 0 && !adding ? (
        <div className='panel p-10 text-center'>
          <p className='font-display text-2xl uppercase text-slate-300'>
            No mods yet.
          </p>
          <p className='mt-2 text-sm text-slate-500'>
            Start your build sheet. What is the first thing you want to change?
          </p>
        </div>
      ) : null}

      {/* Modifications by category */}
      {Object.keys(grouped).length > 0 ? (
        <div className='space-y-8'>
          {Object.entries(grouped).map(([category, mods]) => (
            <section key={category}>
              <h3 className='mb-4 border-b border-carbon-800 pb-2 font-display text-xl font-semibold uppercase tracking-wide text-boost-400'>
                {humanizeCategory(category)}
              </h3>

              <div className='grid gap-4 md:grid-cols-2'>
                {mods.map(mod => (
                  <ModCard
                    key={mod.id}
                    mod={mod}
                    onEdit={() => {
                      setEditingMod(mod)
                      setAdding(false)
                    }}
                    onDelete={() => {
                      const confirmed = window.confirm(
                        'Delete this modification?',
                      )

                      if (confirmed) {
                        deleteMod.mutate(mod.id)
                      }
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : null}
    </div>
  )
}
