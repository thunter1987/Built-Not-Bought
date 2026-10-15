import { useState } from 'react'
import type { FormEvent } from 'react'

import type { Car, CarPayload } from '../../lib/types'

const STATUSES = ['PROJECT', 'STREET', 'TRACK', 'SHOW', 'SOLD']
const DISCIPLINES = [
  'STREET',
  'TIME_ATTACK',
  'TRACK',
  'DRAG',
  'DRIFT',
  'RALLY',
  'CANYON',
  'SHOW',
]
const DRIVETRAINS = ['FWD', 'RWD', 'AWD']
const TRANSMISSIONS = ['MANUAL', 'AUTOMATIC', 'DCT', 'CVT']

type FormState = {
  nickname: string
  year: string
  make: string
  model: string
  trim: string
  status: string
  discipline: string
  description: string
  goals: string
  engine_code: string
  drivetrain: string
  transmission: string
  curb_weight_lb: string
  stock_hp: string
  stock_torque_lbft: string
  specs: string
}

function toState(car?: Car): FormState {
  return {
    nickname: car?.nickname ?? '',
    year: car ? String(car.year) : '',
    make: car?.make ?? '',
    model: car?.model ?? '',
    trim: car?.trim ?? '',
    status: car?.status ?? 'PROJECT',
    discipline: car?.discipline ?? '',
    description: car?.description ?? '',
    goals: car?.goals ?? '',
    engine_code: car?.engine_code ?? '',
    drivetrain: car?.drivetrain ?? '',
    transmission: car?.transmission ?? '',
    curb_weight_lb: car?.curb_weight_lb ? String(car.curb_weight_lb) : '',
    stock_hp: car?.stock_hp ? String(car.stock_hp) : '',
    stock_torque_lbft: car?.stock_torque_lbft
      ? String(car.stock_torque_lbft)
      : '',
    specs:
      car?.specs && Object.keys(car.specs).length > 0
        ? JSON.stringify(car.specs, null, 2)
        : '',
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className='mb-4 border-b border-carbon-800 pb-2 font-display text-xl font-semibold uppercase tracking-wide text-slate-300'>
      {children}
    </h3>
  )
}

export default function CarForm({
  initial,
  onSubmit,
  submitLabel = 'Save build',
  onCancel,
}: {
  initial?: Car
  onSubmit: (payload: CarPayload) => Promise<void>
  submitLabel?: string
  onCancel?: () => void
}) {
  const [form, setForm] = useState<FormState>(() => toState(initial))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm(previous => ({ ...previous, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')

    let specs: Record<string, unknown> = {}

    if (form.specs.trim()) {
      try {
        const parsed: unknown = JSON.parse(form.specs)

        if (
          typeof parsed !== 'object' ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          throw new Error('Invalid specs')
        }

        specs = parsed as Record<string, unknown>
      } catch {
        setError(
          'Specs must be a valid JSON object, like { "fuel": "93 octane" }.',
        )
        return
      }
    }

    const payload: CarPayload = {
      year: Number(form.year),
      make: form.make.trim(),
      model: form.model.trim(),
      specs,
    }

    if (form.nickname.trim()) payload.nickname = form.nickname.trim()
    if (form.trim.trim()) payload.trim = form.trim.trim()
    if (form.engine_code.trim()) payload.engine_code = form.engine_code.trim()
    if (form.description.trim()) payload.description = form.description.trim()
    if (form.goals.trim()) payload.goals = form.goals.trim()

    if (form.status) payload.status = form.status as CarPayload['status']
    if (form.discipline)
      payload.discipline = form.discipline as CarPayload['discipline']
    if (form.drivetrain)
      payload.drivetrain = form.drivetrain as CarPayload['drivetrain']
    if (form.transmission)
      payload.transmission = form.transmission as CarPayload['transmission']

    if (form.curb_weight_lb !== '')
      payload.curb_weight_lb = Number(form.curb_weight_lb)
    if (form.stock_hp !== '') payload.stock_hp = Number(form.stock_hp)
    if (form.stock_torque_lbft !== '')
      payload.stock_torque_lbft = Number(form.stock_torque_lbft)

    setBusy(true)

    try {
      await onSubmit(payload)
    } catch {
      setError('Could not save this build. Check the fields and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      {error ? <p className='error'>{error}</p> : null}

      {/* Identity */}
      <section>
        <SectionTitle>Build identity</SectionTitle>

        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          <div>
            <label className='field-label' htmlFor='year'>
              Year
            </label>
            <input
              id='year'
              className='field-input'
              type='number'
              min='1900'
              max='2100'
              value={form.year}
              onChange={e => update('year', e.target.value)}
              required
            />
          </div>

          <div>
            <label className='field-label' htmlFor='make'>
              Make
            </label>
            <input
              id='make'
              className='field-input'
              placeholder='Toyota'
              value={form.make}
              onChange={e => update('make', e.target.value)}
              required
            />
          </div>

          <div>
            <label className='field-label' htmlFor='model'>
              Model
            </label>
            <input
              id='model'
              className='field-input'
              placeholder='GR Supra'
              value={form.model}
              onChange={e => update('model', e.target.value)}
              required
            />
          </div>

          <div>
            <label className='field-label' htmlFor='nickname'>
              Build name
            </label>
            <input
              id='nickname'
              className='field-input'
              placeholder='Project Supra'
              value={form.nickname}
              onChange={e => update('nickname', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='status'>
              Status
            </label>
            <select
              id='status'
              className='field-input'
              value={form.status}
              onChange={e => update('status', e.target.value)}
            >
              {STATUSES.map(value => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='field-label' htmlFor='discipline'>
              Discipline
            </label>
            <select
              id='discipline'
              className='field-input'
              value={form.discipline}
              onChange={e => update('discipline', e.target.value)}
            >
              <option value=''>Not set</option>
              {DISCIPLINES.map(value => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='field-label' htmlFor='trim'>
              Trim
            </label>
            <input
              id='trim'
              className='field-input'
              placeholder='3.0 Premium'
              value={form.trim}
              onChange={e => update('trim', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='engine_code'>
              Engine code
            </label>
            <input
              id='engine_code'
              className='field-input'
              placeholder='B58'
              value={form.engine_code}
              onChange={e => update('engine_code', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Baseline specs */}
      <section>
        <SectionTitle>Baseline specs</SectionTitle>

        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
          <div>
            <label className='field-label' htmlFor='drivetrain'>
              Drivetrain
            </label>
            <select
              id='drivetrain'
              className='field-input'
              value={form.drivetrain}
              onChange={e => update('drivetrain', e.target.value)}
            >
              <option value=''>Not set</option>
              {DRIVETRAINS.map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='field-label' htmlFor='transmission'>
              Transmission
            </label>
            <select
              id='transmission'
              className='field-input'
              value={form.transmission}
              onChange={e => update('transmission', e.target.value)}
            >
              <option value=''>Not set</option>
              {TRANSMISSIONS.map(value => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='field-label' htmlFor='weight'>
              Weight (lb)
            </label>
            <input
              id='weight'
              className='field-input'
              type='number'
              min='500'
              max='10000'
              value={form.curb_weight_lb}
              onChange={e => update('curb_weight_lb', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='stock_hp'>
              Stock HP
            </label>
            <input
              id='stock_hp'
              className='field-input'
              type='number'
              min='0'
              value={form.stock_hp}
              onChange={e => update('stock_hp', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='stock_torque'>
              Stock torque (lb-ft)
            </label>
            <input
              id='stock_torque'
              className='field-input'
              type='number'
              min='0'
              value={form.stock_torque_lbft}
              onChange={e => update('stock_torque_lbft', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Story */}
      <section>
        <SectionTitle>The build story</SectionTitle>

        <div className='space-y-4'>
          <div>
            <label className='field-label' htmlFor='description'>
              What is this car to you?
            </label>
            <textarea
              id='description'
              className='field-input min-h-24 resize-y'
              placeholder='Bought stock in 2024. Aiming for a reliable street and track build...'
              value={form.description}
              onChange={e => update('description', e.target.value)}
              maxLength={2000}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='goals'>
              What is the goal?
            </label>
            <textarea
              id='goals'
              className='field-input min-h-20 resize-y'
              placeholder='400 whp, balanced handling, sub-1:40 lap, still driveable to work.'
              value={form.goals}
              onChange={e => update('goals', e.target.value)}
              maxLength={1000}
            />
          </div>
        </div>
      </section>

      {/* Flexible specs */}
      <section>
        <SectionTitle>Additional specs</SectionTitle>

        <p className='mb-3 text-xs text-slate-500'>
          Optional JSON for anything that does not fit a standard field: tires,
          final drive, fuel, internals, alignment.
        </p>

        <textarea
          className='field-input min-h-32 resize-y font-mono text-xs'
          placeholder={
            '{\n  "fuel": "93 octane",\n  "tire_front": "275/35R19"\n}'
          }
          value={form.specs}
          onChange={e => update('specs', e.target.value)}
        />
      </section>

      <div className='flex flex-wrap gap-3 border-t border-carbon-800 pt-6'>
        <button type='submit' className='btn btn-primary' disabled={busy}>
          {busy ? 'Saving...' : submitLabel}
        </button>

        {onCancel ? (
          <button
            type='button'
            className='btn btn-secondary'
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
