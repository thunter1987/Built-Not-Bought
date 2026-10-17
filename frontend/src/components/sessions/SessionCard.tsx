import Badge from '../ui/Badge'
import {
  formatSessionResult,
  humanizeSessionType,
} from '../../lib/sessionHelpers'
import type { PerformanceLog } from '../../lib/types'

export default function SessionCard({
  log,
  onEdit,
  onDelete,
}: {
  log: PerformanceLog
  onEdit?: () => void
  onDelete?: () => void
}) {
  const date = new Date(log.occurred_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article className='panel p-5'>
      {/* Header */}
      <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
        <div className='flex-1'>
          <div className='mb-2 flex flex-wrap gap-2'>
            <Badge tone='orange'>{humanizeSessionType(log.log_type)}</Badge>

            {log.fuel_octane ? <Badge>{log.fuel_octane} octane</Badge> : null}
          </div>

          <p className='font-mono text-xs text-slate-500'>{date}</p>

          <p className='mt-2 font-display text-3xl font-semibold text-white'>
            {formatSessionResult(log)}
          </p>
        </div>

        <div className='flex gap-2'>
          {onEdit ? (
            <button
              className='btn btn-secondary px-3! py-1.5! text-xs!'
              onClick={onEdit}
            >
              Edit
            </button>
          ) : null}

          {onDelete ? (
            <button
              className='btn btn-danger px-3! py-1.5! text-xs!'
              onClick={onDelete}
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>

      {/* Conditions */}
      {(log.temperature_f || log.humidity_percent || log.tire_setup) && (
        <div className='mb-4 grid grid-cols-2 gap-4 border-y border-carbon-800 py-4'>
          {log.temperature_f ? (
            <div>
              <p className='text-[10px] uppercase tracking-widest text-slate-600'>
                Temp
              </p>
              <p className='font-mono text-sm text-slate-300'>
                {log.temperature_f}°F
              </p>
            </div>
          ) : null}

          {log.humidity_percent ? (
            <div>
              <p className='text-[10px] uppercase tracking-widest text-slate-600'>
                Humidity
              </p>
              <p className='font-mono text-sm text-slate-300'>
                {log.humidity_percent}%
              </p>
            </div>
          ) : null}

          {log.tire_setup ? (
            <div className='col-span-2'>
              <p className='text-[10px] uppercase tracking-widest text-slate-600'>
                Tires
              </p>
              <p className='font-mono text-sm text-slate-300'>
                {log.tire_setup}
              </p>
            </div>
          ) : null}

          {log.tire_pressure_front_psi || log.tire_pressure_rear_psi ? (
            <div className='col-span-2'>
              <p className='text-[10px] uppercase tracking-widest text-slate-600'>
                Tire pressures
              </p>
              <p className='font-mono text-sm text-slate-300'>
                F: {log.tire_pressure_front_psi ?? '—'} PSI / R:{' '}
                {log.tire_pressure_rear_psi ?? '—'} PSI
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Location */}
      {(log.location || log.track_name) && (
        <div className='mb-4'>
          <p className='text-[10px] uppercase tracking-widest text-slate-600'>
            Location
          </p>
          <p className='mt-1 text-sm text-slate-300'>
            {log.track_name
              ? `${log.track_name}${log.track_layout ? ` (${log.track_layout})` : ''}`
              : log.location}
          </p>
        </div>
      )}

      {/* Notes */}
      {log.notes ? (
        <div className='border-t border-carbon-800 pt-4'>
          <p className='text-[10px] uppercase tracking-widest text-slate-600'>
            Notes
          </p>
          <p className='mt-1 text-sm text-slate-400'>{log.notes}</p>
        </div>
      ) : null}

      {/* Photos */}
      {log.photos && log.photos.length > 0 ? (
        <div className='mt-4 border-t border-carbon-800 pt-4'>
          <p className='mb-2 text-[10px] uppercase tracking-widest text-slate-600'>
            Evidence
          </p>
          <div className='grid grid-cols-2 gap-2'>
            {log.photos.map(photo => (
              <img
                key={photo.id}
                src={photo.url_path}
                alt={photo.original_filename}
                className='h-24 w-full rounded-lg object-cover'
              />
            ))}
          </div>
        </div>
      ) : null}
    </article>
  )
}
