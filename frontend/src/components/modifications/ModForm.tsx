import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  MODIFICATION_CATEGORIES,
  MODIFICATION_PURPOSES,
} from '../../lib/constants'
import type { Modification, ModificationPayload } from '../../lib/types'

type FormState = {
  category: string
  purpose: string
  name: string
  brand: string
  cost: string
  estimated_hp_gain: string
  expected_result: string
  actual_result: string
  installed_at: string
  notes: string
}

function toState(mod?: Modification): FormState {
  return {
    category: mod?.category ?? 'ENGINE',
    purpose: mod?.purpose ?? '',
    name: mod?.name ?? '',
    brand: mod?.brand ?? '',
    cost: mod?.cost ? String(mod.cost) : '',
    estimated_hp_gain: mod?.estimated_hp_gain
      ? String(mod.estimated_hp_gain)
      : '',
    expected_result: mod?.expected_result ?? '',
    actual_result: mod?.actual_result ?? '',
    installed_at: mod?.installed_at ?? '',
    notes: mod?.notes ?? '',
  }
}

export default function ModForm({
  initial,
  onSubmit,
  submitLabel = 'Add mod',
  onCancel,
}: {
  initial?: Modification
  onSubmit: (payload: ModificationPayload) => Promise<void>
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

    if (!form.name.trim()) {
      setError('Part name is required.')
      return
    }

    const payload: ModificationPayload = {
      category: form.category,
      name: form.name.trim(),
    }

    if (form.purpose) payload.purpose = form.purpose
    if (form.brand.trim()) payload.brand = form.brand.trim()
    if (form.cost !== '') payload.cost = Number(form.cost)
    if (form.estimated_hp_gain !== '')
      payload.estimated_hp_gain = Number(form.estimated_hp_gain)
    if (form.expected_result.trim())
      payload.expected_result = form.expected_result.trim()
    if (form.actual_result.trim())
      payload.actual_result = form.actual_result.trim()
    if (form.installed_at) payload.installed_at = form.installed_at
    if (form.notes.trim()) payload.notes = form.notes.trim()

    setBusy(true)

    try {
      await onSubmit(payload)
    } catch {
      setError('Could not save this modification. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {error ? <p className='error'>{error}</p> : null}

      {/* What was installed */}
      <section>
        <h3 className='mb-4 border-b border-carbon-800 pb-2 font-display text-lg font-semibold uppercase tracking-wide text-slate-300'>
          What was installed?
        </h3>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label className='field-label' htmlFor='category'>
              Category
            </label>
            <select
              id='category'
              className='field-input'
              value={form.category}
              onChange={e => update('category', e.target.value)}
              required
            >
              {MODIFICATION_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='field-label' htmlFor='purpose'>
              Purpose
            </label>
            <select
              id='purpose'
              className='field-input'
              value={form.purpose}
              onChange={e => update('purpose', e.target.value)}
            >
              <option value=''>Not set</option>
              {MODIFICATION_PURPOSES.map(pur => (
                <option key={pur.value} value={pur.value}>
                  {pur.label}
                </option>
              ))}
            </select>
          </div>

          <div className='sm:col-span-2'>
            <label className='field-label' htmlFor='name'>
              Part name
            </label>
            <input
              id='name'
              className='field-input'
              placeholder='e.g., Garrett G30-770 Turbo'
              value={form.name}
              onChange={e => update('name', e.target.value)}
              required
            />
          </div>

          <div>
            <label className='field-label' htmlFor='brand'>
              Brand
            </label>
            <input
              id='brand'
              className='field-input'
              placeholder='e.g., Garrett, Mishimoto, KW'
              value={form.brand}
              onChange={e => update('brand', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='installed_at'>
              Install date
            </label>
            <input
              id='installed_at'
              className='field-input'
              type='date'
              value={form.installed_at}
              onChange={e => update('installed_at', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Investment */}
      <section>
        <h3 className='mb-4 border-b border-carbon-800 pb-2 font-display text-lg font-semibold uppercase tracking-wide text-slate-300'>
          Investment
        </h3>

        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label className='field-label' htmlFor='cost'>
              Cost ($)
            </label>
            <input
              id='cost'
              className='field-input'
              type='number'
              min='0'
              step='0.01'
              placeholder='2500'
              value={form.cost}
              onChange={e => update('cost', e.target.value)}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='estimated_hp_gain'>
              Estimated HP gain
            </label>
            <input
              id='estimated_hp_gain'
              className='field-input'
              type='number'
              min='-1000'
              max='5000'
              placeholder='45'
              value={form.estimated_hp_gain}
              onChange={e => update('estimated_hp_gain', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Results */}
      <section>
        <h3 className='mb-4 border-b border-carbon-800 pb-2 font-display text-lg font-semibold uppercase tracking-wide text-slate-300'>
          Results
        </h3>

        <div className='space-y-4'>
          <div>
            <label className='field-label' htmlFor='expected_result'>
              What did you expect?
            </label>
            <textarea
              id='expected_result'
              className='field-input min-h-20 resize-y'
              placeholder='e.g., Better spool, 40+ whp gain over stock turbo'
              value={form.expected_result}
              onChange={e => update('expected_result', e.target.value)}
              maxLength={1000}
            />
          </div>

          <div>
            <label className='field-label' htmlFor='actual_result'>
              What actually happened?
            </label>
            <textarea
              id='actual_result'
              className='field-input min-h-20 resize-y'
              placeholder='e.g., 48 whp gain, spools 300 RPM faster, no issues after 5k miles'
              value={form.actual_result}
              onChange={e => update('actual_result', e.target.value)}
              maxLength={1000}
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
            Additional notes
          </label>
          <textarea
            id='notes'
            className='field-input min-h-24 resize-y'
            placeholder='Installation tips, tuning notes, part numbers, vendor info...'
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            maxLength={2000}
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
