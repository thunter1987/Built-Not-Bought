import clsx from 'clsx'

type Tone = 'orange' | 'slate' | 'green' | 'red'

const tones: Record<Tone, string> = {
  orange: 'border-boost-500/30 bg-boost-500/10 text-boost-300',
  slate: 'border-carbon-700 bg-carbon-800 text-slate-300',
  green: 'border-emerald-800/60 bg-emerald-950/40 text-emerald-300',
  red: 'border-red-900/60 bg-red-950/40 text-red-300',
}

export default function Badge({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode
  tone?: Tone
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md border px-2.5 py-1',
        'text-[10px] font-bold uppercase tracking-[0.18em]',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}
