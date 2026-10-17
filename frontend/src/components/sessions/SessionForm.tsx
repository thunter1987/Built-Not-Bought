import { useState } from 'react'
import type { FormEvent } from 'react'

import { SESSION_TYPES } from '../../lib/sessionHelpers'
import type { PerformanceLog, PerformanceLogPayload } from '../../lib/types'

type FormState = {
  log_type: string
  occurred_at: string
  horsepower: string
  torque_lbft: string
  zero_to_sixty_sec: string
  quarter_mile_sec: string
  quarter_mile_mph: string
  sixty_to_zero_ft: string
  lap_time_sec: string
  temperature_f: string
  humidity_percent: string
  fuel_octane: string
  tire_setup: string
  tire_pressure_front_psi: string
  tire_pressure_rear_psi: string
  location: string
  track_name: string
  track_layout: string
  notes: string
}

function toState(log?: PerformanceLog): FormState {
  return {
    log_type: log?.log_type ?? 'DYNO',
    occurred_at: log?.occurred_at ? log.occurred_at.split('T')[0] : '',
    horsepower: log?.horsepower ? String(log.horsepower) : '',
    torque_lbft: log?.torque_lbft ? String(log.torque_lbft) : '',
    zero_to_sixty_sec: log?.zero_to_sixty_sec
      ? String(log.zero_to_sixty_sec)
      : '',
    quarter_mile_sec: log?.quarter_mile_sec ? String(log.quarter_mile_sec) : '',
    quarter_mile_mph: log?.quarter_mile_mph ? String(log.quarter_mile_mph) : '',
    sixty_to_zero_ft: log?.sixty_to_zero_ft ? String(log.sixty_to_zero_ft) : '',
    lap_time_sec: log?.lap_time_sec ? String(log.lap_time_sec) : '',
    temperature_f: log?.temperature_f ? String(log.temperature_f) : '',
    humidity_percent: log?.humidity_percent ? String(log.humidity_percent) : '',
    fuel_octane: log?.fuel_octane ? String(log.fuel_octane) : '',
    tire_setup: log?.tire_setup ?? '',
    tire_pressure_front_psi: log?.tire_pressure_front_psi
      ? String(log.tire_pressure_front_psi)
      : '',
    tire_pressure_rear_psi: log?.tire_pressure_rear_psi
      ? String(log.tire_pressure_rear_psi)
      : '',
    location: log?.location ?? '',
    track_name: log?.track_name ?? '',
    track_layout: log?.track_layout ?? '',
    notes: log?.notes ?? '',
  }
}

export default function SessionForm({
  initial,
  onSubmit,
  submitLabel = 'Log session',
  onCancel,
}: {
  initial?: PerformanceLog
  onSubmit: (payload: PerformanceLogPayload) => Promise<void>
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

    const payload: PerformanceLogPayload = {
      log_type: form.log_type as PerformanceLogPayload['log_type'],
    }

    if (form.occurred_at) payload.occurred_at = form.occurred_at
    if (form.horsepower) payload.horsepower = Number(form.horsepower)
    if (form.torque_lbft) payload.torque_lbft = Number(form.torque_lbft)
    if (form.zero_to_sixty_sec)
      payload.zero_to_sixty_sec = Number(form.zero_to_sixty_sec)
    if (form.quarter_mile_sec)
      payload.quarter_mile_sec = Number(form.quarter_mile_sec)
    if (form.quarter_mile_mph)
      payload.quarter_mile_mph = Number(form.quarter_mile_mph)
    if (form.sixty_to_zero_ft)
      payload.sixty_to_zero_ft = Number(form.sixty_to_zero_ft)
    if (form.lap_time_sec) payload.lap_time_sec = Number(form.lap_time_sec)
    if (form.temperature_f) payload.temperature_f = Number(form.temperature_f)
    if (form.humidity_percent)
      payload.humidity_percent = Number(form.humidity_percent)
    if (form.fuel_octane) payload.fuel_octane = Number(form.fuel_octane)
    if (form.tire_setup) payload.tire_setup = form.tire_setup
    if (form.tire_pressure_front_psi)
      payload.tire_pressure_front_psi = Number(form.tire_pressure_front_psi)
    if (form.tire_pressure_rear_psi)
      payload.tire_pressure_rear_psi = Number(form.tire_pressure_rear_psi)
    if (form.location) payload.location = form.location
    if (form.track_name) payload.track_name = form.track_name
    if (form.track_layout) payload.track_layout = form.track_layout
    if (form.notes) payload.notes = form.notes

    setBusy(true)

    try {
      await onSubmit(payload)
    } catch {
      setError('Could not save this session. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {error ? <p className='error'>{error}</p> : null}

      {/* Session type */}
      <section>
        <h3 className='mb-4 border-b border-carbon-800 pb-2 font-display text-lg font-semibold uppercase tracking-wide text-slate-300'>
          Session type
        </h3>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label className='field-label' htmlFor='log_type'>
              Type
            </label>
            <select
              id='log_type'
              className='field-input'
              value={form.log_type}
              onChange={e => update('log_type', e.target.value)}
              required
            >
              {SESSION_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='field-label' htmlFor='occurred_at'>
              Date
            </label>
            <input
              id='occurred_at'
              className='field-input'
              type='date'
              value={form.occurred_at}
              onChange={e => update('occurred_at', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Results */}
      <section>
        <h3 className='mb-4 border-b border-carbon-800 pb-2 font-display text-lg font-semibold uppercase tracking-wide text-slate-300'>
          Results
        </h3>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <div>
            <label className='field-label' htmlFor='horsepower'>
              Horsepower
            </label>
            <input
              id='horsepower'
              className='field-input'
              type='number'
              min='0'
              placeholder='412'
              value={form.horsepower}
              onChange={e => update('horsepower', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='torque_lbft'>
              Torque (lb-ft)
            </label>
            <input
              id='torque_lbft'
              className='field-input'
              type='number'
              min='0'
              placeholder='398'
              value={form.torque_lbft}
              onChange={e => update('torque_lbft', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='zero_to_sixty_sec'>
              0–60 (sec)
            </label>
            <input
              id='zero_to_sixty_sec'
              className='field-input'
              type='number'
              min='0'
              step='0.01'
              placeholder='4.3'
              value={form.zero_to_sixty_sec}
              onChange={e => update('zero_to_sixty_sec', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='quarter_mile_sec'>
              1/4 mile (sec)
            </label>
            <input
              id='quarter_mile_sec'
              className='field-input'
              type='number'
              min='0'
              step='0.01'
              placeholder='12.6'
              value={form.quarter_mile_sec}
              onChange={e => update('quarter_mile_sec', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='quarter_mile_mph'>
              Trap speed (mph)
            </label>
            <input
              id='quarter_mile_mph'
              className='field-input'
              type='number'
              min='0'
              placeholder='112'
              value={form.quarter_mile_mph}
              onChange={e => update('quarter_mile_mph', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='sixty_to_zero_ft'>
              60–0 (ft)
            </label>
            <input
              id='sixty_to_zero_ft'
              className='field-input'
              type='number'
              min='0'
              step='0.1'
              placeholder='105'
              value={form.sixty_to_zero_ft}
              onChange={e => update('sixty_to_zero_ft', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='lap_time_sec'>
              Lap time (sec)
            </label>
            <input
              id='lap_time_sec'
              className='field-input'
              type='number'
              min='0'
              step='0.01'
              placeholder='102.8'
              value={form.lap_time_sec}
              onChange={e => update('lap_time_sec', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section>
        <h3 className='mb-4 border-b border-carbon-800 pb-2 font-display text-lg font-semibold uppercase tracking-wide text-slate-300'>
          Conditions
        </h3>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <div>
            <label className='field-label' htmlFor='temperature_f'>
              Temperature (°F)
            </label>
            <input
              id='temperature_f'
              className='field-input'
              type='number'
              min='-50'
              max='150'
              placeholder='72'
              value={form.temperature_f}
              onChange={e => update('temperature_f', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='humidity_percent'>
              Humidity (%)
            </label>
            <input
              id='humidity_percent'
              className='field-input'
              type='number'
              min='0'
              max='100'
              placeholder='45'
              value={form.humidity_percent}
              onChange={e => update('humidity_percent', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='fuel_octane'>
              Fuel octane
            </label>
            <input
              id='fuel_octane'
              className='field-input'
              type='number'
              min='85'
              max='120'
              placeholder='93'
              value={form.fuel_octane}
              onChange={e => update('fuel_octane', e.target.value)}
            />
          </div>

          <div className='sm:col-span-2 lg:col-span-3'>
            <label className='field-label' htmlFor='tire_setup'>
              Tire setup
            </label>
            <input
              id='tire_setup'
              className='field-input'
              placeholder='Michelin Pilot Sport 4S, 275/35R19'
              value={form.tire_setup}
              onChange={e => update('tire_setup', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='tire_pressure_front_psi'>
              Front tire pressure (PSI)
            </label>
            <input
              id='tire_pressure_front_psi'
              className='field-input'
              type='number'
              min='0'
              max='100'
              step='0.5'
              placeholder='32'
              value={form.tire_pressure_front_psi}
              onChange={e => update('tire_pressure_front_psi', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='tire_pressure_rear_psi'>
              Rear tire pressure (PSI)
            </label>
            <input
              id='tire_pressure_rear_psi'
              className='field-input'
              type='number'
              min='0'
              max='100'
              step='0.5'
              placeholder='30'
              value={form.tire_pressure_rear_psi}
              onChange={e => update('tire_pressure_rear_psi', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section>
        <h3 className='mb-4 border-b border-carbon-800 pb-2 font-display text-lg font-semibold uppercase tracking-wide text-slate-300'>
          Location
        </h3>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <div>
            <label className='field-label' htmlFor='location'>
              General location
            </label>
            <input
              id='location'
              className='field-input'
              placeholder='e.g., local dyno shop'
              value={form.location}
              onChange={e => update('location', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='track_name'>
              Track name
            </label>
            <input
              id='track_name'
              className='field-input'
              placeholder='e.g., Laguna Seca'
              value={form.track_name}
              onChange={e => update('track_name', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='track_layout'>
              Track layout
            </label>
            <input
              id='track_layout'
              className='field-input'
              placeholder='e.g., Full course'
              value={form.track_layout}
              onChange={e => update('track_layout', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section>
        <h3 className='mb-4 border-b border-carbon-800 pb-2 font-display text-lg font-semibold uppercase tracking-wide text-slate-300'>
          Notes
        </h3>

        <div>
          <label className='field-label' htmlFor='notes'>
            Session notes
          </label>
          <textarea
            id='notes'
            className='field-input min-h-32 resize-y'
            placeholder="What worked, what didn't, what to try next time..."
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            maxLength={5000}
          />
        </div>
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
