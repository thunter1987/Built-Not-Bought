import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import CarForm from '../components/cars/CarForm'
import Badge from '../components/ui/Badge'
import StatTile from '../components/ui/StatTile'
import BuildSheet from '../components/modifications/BuildSheet'
import SessionList from '../components/sessions/SessionList'
import AnalyticsPanel from '../components/analytics/AnalyticsPanel'
import { api } from '../lib/api'
import { formatLapTime, humanizeEnum, powerToWeight } from '../lib/format'
import type { Car, CarPayload, CarPhoto } from '../lib/types'

type Tab =
  | 'overview'
  | 'analytics'
  | 'build-sheet'
  | 'sessions'
  | 'photos'
  | 'specs'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'build-sheet', label: 'Build Sheet' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'photos', label: 'Photo Gallery' },
  { id: 'specs', label: 'Spec Sheet' },
]

export default function CarDetailPage() {
  const { carId } = useParams<{ carId: string }>()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('overview')
  const [editing, setEditing] = useState(false)

  const carQuery = useQuery({
    queryKey: ['car', carId],
    queryFn: async () => {
      const response = await api.get<Car>(`/cars/${carId}`)
      return response.data
    },
    enabled: Boolean(carId),
  })

  const updateCar = useMutation({
    mutationFn: async (payload: CarPayload) => {
      const response = await api.patch<Car>(`/cars/${carId}`, payload)
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['car', carId] })
      void queryClient.invalidateQueries({ queryKey: ['cars'] })
      setEditing(false)
    },
  })

  const uploadPhoto = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<CarPhoto>(
        `/cars/${carId}/photos`,
        formData,
      )

      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['car', carId] })
    },
  })

  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      await api.delete(`/cars/${carId}/photos/${photoId}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['car', carId] })
    },
  })

  const deleteCar = useMutation({
    mutationFn: async () => {
      await api.delete(`/cars/${carId}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cars'] })
      navigate('/dashboard')
    },
  })

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file) {
      uploadPhoto.mutate(file)
    }

    event.target.value = ''
  }

  if (carQuery.isLoading) {
    return (
      <div className='page'>
        <p className='font-mono text-sm text-slate-500'>Loading build...</p>
      </div>
    )
  }

  if (carQuery.isError || !carQuery.data) {
    return (
      <div className='page'>
        <p className='error'>Could not load this build.</p>
        <Link to='/dashboard' className='btn btn-secondary mt-4'>
          Back to garage
        </Link>
      </div>
    )
  }

  const car = carQuery.data
  const cover = car.photos?.[0]
  const ratio = powerToWeight(car.stock_hp, car.curb_weight_lb)

  return (
    <div className='mx-auto max-w-6xl px-6 py-8'>
      {/* Header */}
      <header className='mb-6 flex flex-wrap items-center justify-between gap-4'>
        <Link
          to='/dashboard'
          className='text-xs uppercase tracking-[0.2em] text-slate-500 transition hover:text-boost-400'
        >
          ← Back to garage
        </Link>

        <div className='flex flex-wrap gap-3'>
          <button
            className='btn btn-secondary'
            onClick={() => setEditing(previous => !previous)}
          >
            {editing ? 'Close editor' : 'Edit build'}
          </button>

          <button
            className='btn btn-danger'
            disabled={deleteCar.isPending}
            onClick={() => {
              const confirmed = window.confirm(
                'Delete this build, its photos, and all related records? This cannot be undone.',
              )

              if (confirmed) {
                deleteCar.mutate()
              }
            }}
          >
            Delete build
          </button>
        </div>
      </header>

      {/* Editor */}
      {editing ? (
        <div className='panel mb-6 p-6'>
          <CarForm
            initial={car}
            submitLabel='Save changes'
            onCancel={() => setEditing(false)}
            onSubmit={async payload => {
              await updateCar.mutateAsync(payload)
            }}
          />
        </div>
      ) : null}

      {/* Hero */}
      <section className='panel hero-gradient overflow-hidden'>
        <div className='grid gap-6 p-6 lg:grid-cols-[1.1fr_1fr] lg:p-8'>
          <div className='flex flex-col justify-center'>
            <div className='mb-4 flex flex-wrap gap-2'>
              {car.status ? (
                <Badge tone='orange'>{humanizeEnum(car.status)}</Badge>
              ) : null}

              {car.discipline ? (
                <Badge>{humanizeEnum(car.discipline)}</Badge>
              ) : null}

              {car.drivetrain ? <Badge>{car.drivetrain}</Badge> : null}
            </div>

            <h1 className='font-display text-5xl font-bold uppercase leading-[0.95] text-white sm:text-6xl'>
              {car.nickname || `${car.make} ${car.model}`}
            </h1>

            <p className='mt-3 font-mono text-sm text-slate-400'>
              {car.year} {car.make} {car.model}
              {car.trim ? ` · ${car.trim}` : ''}
            </p>

            {car.description ? (
              <p className='mt-5 max-w-xl text-sm leading-relaxed text-slate-300'>
                {car.description}
              </p>
            ) : (
              <p className='mt-5 max-w-xl text-sm italic text-slate-500'>
                No build story yet. Edit this build and tell us how it started.
              </p>
            )}

            <div className='mt-6 flex flex-wrap gap-3'>
              {car.engine_code ? (
                <span className='font-mono text-xs text-boost-400'>
                  ENGINE / {car.engine_code}
                </span>
              ) : null}

              {car.transmission ? (
                <span className='font-mono text-xs text-slate-500'>
                  {humanizeEnum(car.transmission)}
                </span>
              ) : null}
            </div>
          </div>

          <div className='overflow-hidden rounded-lg border border-carbon-700'>
            {cover ? (
              <img
                src={cover.url_path}
                alt={cover.original_filename}
                className='h-full max-h-80 w-full object-cover'
              />
            ) : (
              <button
                onClick={() => setTab('photos')}
                className='flex h-full min-h-56 w-full flex-col items-center justify-center gap-3 bg-carbon-950/60 transition hover:bg-carbon-900'
              >
                <span className='font-display text-5xl font-bold uppercase text-carbon-700'>
                  No cover yet
                </span>
                <span className='text-xs uppercase tracking-widest text-boost-400'>
                  Add a garage shot →
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stat readouts */}
      <section className='mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
        <StatTile
          label='Stock HP'
          value={car.stock_hp ? String(car.stock_hp) : '—'}
          unit='hp'
          accent
        />

        <StatTile
          label='Stock torque'
          value={car.stock_torque_lbft ? String(car.stock_torque_lbft) : '—'}
          unit='lb-ft'
        />

        <StatTile
          label='Weight'
          value={car.curb_weight_lb ? car.curb_weight_lb.toLocaleString() : '—'}
          unit='lb'
        />

        <StatTile
          label='Stock lb/hp'
          value={ratio ? ratio.toFixed(2) : '—'}
          hint='Lower is better'
        />

        <StatTile
          label='Best 0–60'
          value='—'
          unit='sec'
          hint='Sessions coming next'
        />

        <StatTile
          label='Best lap'
          value={formatLapTime(null)}
          hint='Sessions coming next'
        />
      </section>

      {/* Tabs */}
      <div className='mt-8 flex gap-1 border-b border-carbon-800'>
        {TABS.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={
              tab === item.id
                ? 'border-b-2 border-boost-500 px-4 py-3 text-xs font-bold uppercase tracking-widest text-boost-400'
                : 'border-b-2 border-transparent px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:text-slate-300'
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' ? (
        <div className='mt-6 grid gap-6 lg:grid-cols-2'>
          <section className='panel p-6'>
            <h2 className='mb-4 font-display text-2xl font-semibold uppercase text-white'>
              The goal
            </h2>

            {car.goals ? (
              <p className='text-sm leading-relaxed text-slate-300'>
                {car.goals}
              </p>
            ) : (
              <p className='text-sm italic text-slate-500'>
                What is this build trying to achieve? A power target? A lap
                time? A car that still works as a daily?
              </p>
            )}
          </section>

          <section className='panel p-6'>
            <h2 className='mb-4 font-display text-2xl font-semibold uppercase text-white'>
              Baseline sheet
            </h2>

            <dl className='space-y-3 text-sm'>
              {[
                ['Drivetrain', car.drivetrain],
                ['Transmission', humanizeEnum(car.transmission)],
                ['Engine', car.engine_code],
                ['Discipline', humanizeEnum(car.discipline)],
                ['Status', humanizeEnum(car.status)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className='flex justify-between border-b border-carbon-800 pb-2'
                >
                  <dt className='text-slate-500'>{label}</dt>
                  <dd className='font-mono text-slate-200'>
                    {value && value !== 'Unspecified' ? value : '—'}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      ) : null}

      {/* Analytics */}
      {tab === 'analytics' ? (
        <section className='mt-6'>
          <AnalyticsPanel carId={car.id} />
        </section>
      ) : null}

      {/* Build Sheet */}
      {tab === 'build-sheet' ? (
        <section className='mt-6'>
          <BuildSheet carId={car.id} />
        </section>
      ) : null}

      {/* Sessions */}
      {tab === 'sessions' ? (
        <section className='mt-6'>
          <SessionList carId={car.id} />
        </section>
      ) : null}

      {/* Photos */}
      {tab === 'photos' ? (
        <section className='mt-6'>
          <div className='panel mb-6 flex flex-wrap items-center justify-between gap-4 p-5'>
            <div>
              <h2 className='font-display text-xl font-semibold uppercase text-white'>
                Add a photo
              </h2>
              <p className='mt-1 text-xs text-slate-500'>
                Garage shots, dyno sheets, track days, work in progress. JPG,
                PNG, WEBP or GIF.
              </p>
            </div>

            <input
              type='file'
              accept='image/png,image/jpeg,image/webp,image/gif'
              onChange={handleFileChange}
              disabled={uploadPhoto.isPending}
              className='max-w-full text-xs text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-boost-500 file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-carbon-950 hover:file:bg-boost-400'
            />
          </div>

          {uploadPhoto.isPending ? (
            <p className='mb-4 font-mono text-xs text-boost-400'>
              Uploading...
            </p>
          ) : null}

          {uploadPhoto.isError ? (
            <p className='error mb-4'>
              Upload failed. Check the file type and size limit.
            </p>
          ) : null}

          {deletePhoto.isError ? (
            <p className='error mb-4'>Could not delete that photo.</p>
          ) : null}

          {car.photos && car.photos.length > 0 ? (
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
              {car.photos.map(photo => (
                <figure key={photo.id} className='panel overflow-hidden'>
                  <img
                    src={photo.url_path}
                    alt={photo.original_filename}
                    className='h-56 w-full object-cover'
                  />

                  <figcaption className='flex items-center justify-between gap-3 p-4'>
                    <span className='truncate text-xs text-slate-500'>
                      {photo.original_filename}
                    </span>

                    <button
                      className='btn btn-danger px-3! py-1.5! text-xs!'
                      onClick={() => deletePhoto.mutate(photo.id)}
                      disabled={deletePhoto.isPending}
                    >
                      Delete
                    </button>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className='panel p-10 text-center'>
              <p className='font-display text-2xl uppercase text-slate-300'>
                No garage shots yet.
              </p>
              <p className='mt-2 text-sm text-slate-500'>
                Every build deserves a good photo.
              </p>
            </div>
          )}
        </section>
      ) : null}

      {/* Specs */}
      {tab === 'specs' ? (
        <section className='panel mt-6 p-6'>
          <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
            <h2 className='font-display text-2xl font-semibold uppercase text-white'>
              Spec sheet
            </h2>

            <button
              className='btn btn-secondary py-2! text-xs!'
              onClick={() => setEditing(true)}
            >
              Edit specs
            </button>
          </div>

          {car.specs && Object.keys(car.specs).length > 0 ? (
            <pre className='pre'>{JSON.stringify(car.specs, null, 2)}</pre>
          ) : (
            <p className='text-sm text-slate-500'>
              No additional specs yet. Tires, final drive, fuel, internals,
              alignment — add them in the build editor.
            </p>
          )}
        </section>
      ) : null}
    </div>
  )
}
