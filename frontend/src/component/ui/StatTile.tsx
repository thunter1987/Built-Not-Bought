import clsx from 'clsx'

export default function StatTile({
  label,
  value,
  unit,
  hint,
  accent = false,
}: {
  label: string
  value: string
  unit?: string
  hint?: string
  accent?: boolean
}) {
  return (
    <div className='panel p-4'>
      <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500'>
        {label}
      </p>

      <p className={clsx('stat-value mt-2', accent && 'text-boost-400')}>
        {value}
        {unit ? (
          <span className='ml-1 text-sm font-normal text-slate-500'>
            {unit}
          </span>
        ) : null}
      </p>

      {hint ? <p className='mt-1 text-[11px] text-slate-600'>{hint}</p> : null}
    </div>
  )
}
