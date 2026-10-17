import { useEffect, useMemo } from 'react'

import SearchableSelect from '../ui/SearchableSelect'
import {
  extractYearFromTrim,
  getAllMakes,
  getModelsForMake,
  getTrimsForModel,
} from '../../lib/vehicleData'

type Props = {
  year: string
  make: string
  model: string
  trim: string

  onYearChange: (value: string) => void
  onMakeChange: (value: string) => void
  onModelChange: (value: string) => void
  onTrimChange: (value: string) => void
}

export default function VehicleSelector({
  year,
  make,
  model,
  trim,
  onYearChange,
  onMakeChange,
  onModelChange,
  onTrimChange,
}: Props) {
  const makes = useMemo(() => {
    return getAllMakes().map(m => ({
      value: m.name,
      label: m.name,
    }))
  }, [])

  const models = useMemo(() => {
    if (!make) {
      return []
    }

    return getModelsForMake(make).map(m => ({
      value: m.name,
      label: m.name,
    }))
  }, [make])

  const trims = useMemo(() => {
    if (!make || !model) {
      return []
    }

    return getTrimsForModel(make, model).map(t => ({
      value: t,
      label: t,
    }))
  }, [make, model])

  // When make changes, reset model and trim
  useEffect(() => {
    if (make) {
      const validModels = getModelsForMake(make)

      if (!validModels.some(m => m.name === model)) {
        onModelChange('')
        onTrimChange('')
      }
    } else {
      onModelChange('')
      onTrimChange('')
    }
  }, [make, model, onModelChange, onTrimChange])

  // When model changes, reset trim
  useEffect(() => {
    if (model) {
      const validTrims = getTrimsForModel(make, model)

      if (!validTrims.includes(trim)) {
        onTrimChange('')
      }
    } else {
      onTrimChange('')
    }
  }, [make, model, trim, onTrimChange])

  function handleTrimSelect(value: string) {
    onTrimChange(value)

    // Auto-fill year from trim
    const extractedYear = extractYearFromTrim(value)

    if (extractedYear && !year) {
      onYearChange(String(extractedYear))
    }
  }

  return (
    <section>
      <h3 className='mb-4 border-b border-carbon-800 pb-2 font-display text-xl font-semibold uppercase tracking-wide text-slate-300'>
        Vehicle
      </h3>

      <p className='mb-4 text-xs text-slate-500'>
        Search for your make, model, and trim. Year auto-fills when you pick a
        trim.
      </p>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
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
            value={year}
            onChange={e => onYearChange(e.target.value)}
            placeholder='2020'
          />
        </div>

        <div>
          <label className='field-label'>Make</label>
          <SearchableSelect
            options={makes}
            value={make}
            onChange={onMakeChange}
            placeholder='Search makes...'
            emptyMessage='No makes found'
            allowCustom
          />
        </div>

        <div>
          <label className='field-label'>Model</label>
          <SearchableSelect
            options={models}
            value={model}
            onChange={onModelChange}
            placeholder={make ? 'Search models...' : 'Select a make first'}
            emptyMessage='No models found'
            disabled={!make}
            allowCustom
          />
        </div>

        <div>
          <label className='field-label'>Trim</label>
          <SearchableSelect
            options={trims}
            value={trim}
            onChange={handleTrimSelect}
            placeholder={model ? 'Search trims...' : 'Select a model first'}
            emptyMessage='No trims found'
            disabled={!model}
            allowCustom
          />
        </div>
      </div>
    </section>
  )
}
