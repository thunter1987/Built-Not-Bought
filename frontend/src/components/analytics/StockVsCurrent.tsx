import type { StockVsCurrent as StockVsCurrentData } from '../../lib/types'

function Delta({
  value,
  unit,
  inverse = false,
}: {
  value: number | null
  unit: string
  inverse?: boolean
}) {
  if (value === null || value === 0) {
    return <span className='text-slate-500'>—</span>
  }

  const isPositive = value > 0
  const isGood = inverse ? !isPositive : isPositive
  const prefix = isPositive ? '+' : ''
  const color = isGood ? 'text-emerald-400' : 'text-red-400'

  return (
    <span className={`font-mono text-sm font-semibold ${color}`}>
      {prefix}
      {value.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unit}
    </span>
  )
}

function Metric({
  label,
  stock,
  current,
  delta,
  unit,
  inverse,
}: {
  label: string
  stock: number | null
  current: number | null
  delta: number | null
  unit: string
  inverse?: boolean
}) {
  return (
    <div className='rounded-lg border border-carbon-800 bg-carbon-950/50 p-4'>
      <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500'>
        {label}
      </p>

      <div className='mt-3 flex items-end justify-between gap-3'>
        <div>
          <p className='text-[10px] uppercase tracking-widest text-slate-600'>
            Stock
          </p>
          <p className='font-mono text-lg text-slate-300'>
            {stock !== null ? stock.toLocaleString() : '—'}
            {stock !== null ? (
              <span className='ml-1 text-xs text-slate-500'>{unit}</span>
            ) : null}
          </p>
        </div>

        <div className='text-right'>
          <p className='text-[10px] uppercase tracking-widest text-slate-600'>
            Current
          </p>
          <p className='font-mono text-lg text-boost-400'>
            {current !== null ? current.toLocaleString() : '—'}
            {current !== null ? (
              <span className='ml-1 text-xs text-slate-500'>{unit}</span>
            ) : null}
          </p>
        </div>
      </div>

      <div className='mt-3 border-t border-carbon-800 pt-3'>
        <p className='text-[10px] uppercase tracking-widest text-slate-600'>
          Change
        </p>
        <Delta value={delta} unit={unit} inverse={inverse} />
      </div>
    </div>
  )
}

export default function StockVsCurrent({ data }: { data: StockVsCurrentData }) {
  return (
    <section className='panel p-6'>
      <div className='mb-5'>
        <h3 className='font-display text-xl font-semibold uppercase tracking-wide text-white'>
          Stock vs current
        </h3>
        <p className='mt-1 text-xs text-slate-500'>
          What you started with vs what you have now.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Metric
          label='Horsepower'
          stock={data.stock_hp}
          current={data.current_hp}
          delta={data.hp_gain}
          unit='hp'
        />

        <Metric
          label='Weight'
          stock={data.stock_weight}
          current={data.current_weight}
          delta={
            data.stock_weight && data.current_weight
              ? data.current_weight - data.stock_weight
              : null
          }
          unit='lb'
          inverse
        />

        <Metric
          label='Power-to-weight'
          stock={data.stock_power_to_weight}
          current={data.current_power_to_weight}
          delta={
            data.stock_power_to_weight && data.current_power_to_weight
              ? data.current_power_to_weight - data.stock_power_to_weight
              : null
          }
          unit='lb/hp'
          inverse
        />

        <div className='rounded-lg border border-boost-500/30 bg-boost-500/5 p-4'>
          <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-boost-300'>
            Build ROI
          </p>

          <p className='mt-3 text-[10px] uppercase tracking-widest text-slate-500'>
            HP gain
          </p>
          <p className='font-mono text-2xl font-semibold text-boost-400'>
            {data.hp_gain !== null ? `+${data.hp_gain}` : '—'}
            <span className='ml-1 text-sm font-normal text-slate-500'>hp</span>
          </p>
        </div>
      </div>
    </section>
  )
}
