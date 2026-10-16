import Badge from '../ui/Badge'
import { humanizeCategory, humanizePurpose } from '../../lib/constants'
import type { Modification } from '../../lib/types'

export default function ModCard({
  mod,
  onEdit,
  onDelete,
}: {
  mod: Modification
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <article className='panel p-5'>
      {/* Header */}
      <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
        <div className='flex-1'>
          <div className='mb-2 flex flex-wrap gap-2'>
            <Badge tone='orange'>{humanizeCategory(mod.category)}</Badge>

            {mod.purpose ? <Badge>{humanizePurpose(mod.purpose)}</Badge> : null}
          </div>

          <h3 className='font-display text-xl font-semibold uppercase text-white'>
            {mod.name}
          </h3>

          {mod.brand ? (
            <p className='mt-1 text-sm text-slate-400'>{mod.brand}</p>
          ) : null}
        </div>

        <div className='flex gap-2'>
          {onEdit ? (
            <button
              className='btn btn-secondary !px-3 !py-1.5 !text-xs'
              onClick={onEdit}
            >
              Edit
            </button>
          ) : null}

          {onDelete ? (
            <button
              className='btn btn-danger !px-3 !py-1.5 !text-xs'
              onClick={onDelete}
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>

      {/* Stats */}
      <div className='mb-4 grid grid-cols-2 gap-4 border-y border-carbon-800 py-4'>
        <div>
          <p className='text-[10px] uppercase tracking-widest text-slate-600'>
            Cost
          </p>
          <p className='font-mono text-lg text-white'>
            {mod.cost
              ? `$${mod.cost.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}`
              : '—'}
          </p>
        </div>

        <div>
          <p className='text-[10px] uppercase tracking-widest text-slate-600'>
            Est. HP gain
          </p>
          <p className='font-mono text-lg text-boost-400'>
            {mod.estimated_hp_gain ? `+${mod.estimated_hp_gain}` : '—'}
            {mod.estimated_hp_gain ? (
              <span className='ml-1 text-xs text-slate-500'>hp</span>
            ) : null}
          </p>
        </div>
      </div>

      {/* Results */}
      {(mod.expected_result || mod.actual_result) && (
        <div className='space-y-3'>
          {mod.expected_result ? (
            <div>
              <p className='text-[10px] uppercase tracking-widest text-slate-600'>
                Expected
              </p>
              <p className='mt-1 text-sm text-slate-300'>
                {mod.expected_result}
              </p>
            </div>
          ) : null}

          {mod.actual_result ? (
            <div>
              <p className='text-[10px] uppercase tracking-widest text-slate-600'>
                Actual
              </p>
              <p className='mt-1 text-sm text-slate-200'>{mod.actual_result}</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Install date */}
      {mod.installed_at ? (
        <p className='mt-4 text-xs text-slate-500'>
          Installed: {new Date(mod.installed_at).toLocaleDateString()}
        </p>
      ) : null}

      {/* Notes */}
      {mod.notes ? (
        <div className='mt-4 border-t border-carbon-800 pt-4'>
          <p className='text-[10px] uppercase tracking-widest text-slate-600'>
            Notes
          </p>
          <p className='mt-1 text-sm text-slate-400'>{mod.notes}</p>
        </div>
      ) : null}
    </article>
  )
}
