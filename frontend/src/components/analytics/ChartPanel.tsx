import type { ReactNode } from 'react'

export default function ChartPanel({
  title,
  subtitle,
  emptyMessage,
  hasData,
  children,
}: {
  title: string
  subtitle?: string
  emptyMessage?: string
  hasData: boolean
  children: ReactNode
}) {
  return (
    <section className='panel p-6'>
      <div className='mb-5 flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h3 className='font-display text-xl font-semibold uppercase tracking-wide text-white'>
            {title}
          </h3>
          {subtitle ? (
            <p className='mt-1 text-xs text-slate-500'>{subtitle}</p>
          ) : null}
        </div>
      </div>

      {hasData ? (
        children
      ) : (
        <div className='flex h-64 items-center justify-center rounded-lg border border-dashed border-carbon-700 bg-carbon-950/50'>
          <p className='text-sm italic text-slate-500'>
            {emptyMessage ?? 'No data yet.'}
          </p>
        </div>
      )}
    </section>
  )
}
