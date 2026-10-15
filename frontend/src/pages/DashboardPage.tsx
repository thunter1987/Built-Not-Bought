import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import CarForm from '../component/cars/CarForm'
import Badge from '../component/ui/Badge'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { humanizeEnum } from '../lib/format'
import type { Car, CarPayload } from '../lib/types'

function CoverImage({ car }: { car: Car }) {
  const cover = car.photos?.[0]

  if (cover) {
    return (
      <img
        src={cover.url_path}
        alt={cover.original_filename}
        className='h-48 w-full object-cover transition duration-500 group-hover:scale-105'
      />
    )
  }

  return (
    <div className='hero-gradient relative flex h-48 items-end overflow-hidden p-5'>
      <span className='pointer-events-none absolute -right-2 top-2 font-display text-8xl font-bold uppercase text-white/5'>
        BNB
      </span>

      <div className='relative'>
        <p className='font-mono text-xs text-boost-400'>
          {car.engine_code || 'ENGINE TBD'}
        </p>
        <p className='font-display text-2xl font-semibold uppercase text-slate-300'>
          {car.drivetrain || 'RWD'} · {car.transmission || 'MANUAL'}
        </p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()

  const [adding, setAdding] = useState(false)

  const carsQuery = useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      const response = await api.get<Car[]>('/cars')
      return response.data
    },
  })

  const createCar = useMutation({
    mutationFn: async (payload: CarPayload) => {
      const response = await api.post<Car>('/cars', payload)
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cars'] })
      setAdding(false)
    },
  })

  return (
    <div className='mx-auto max-w-6xl px-6 py-8'>
      {/* App header */}
      <header className='mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-carbon-800 pb-6'>
        <div>
          <p className='font-display text-3xl font-bold uppercase tracking-tight text-white'>
            Built<span className='text-boost-500'> Not </span>Bought
          </p>
          <p className='text-[10px] uppercase tracking-[0.3em] text-slate-500'>
            Document the build. Track the performance.
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <span className='font-mono text-xs text-slate-500'>
            @{user?.username}
          </span>
          <button className='btn btn-secondary' onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Page heading */}
      <div className='mb-6 flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='font-display text-5xl font-bold uppercase leading-none text-white'>
            The Garage
          </h1>
          <p className='mt-2 text-sm text-slate-500'>
            {carsQuery.data?.length ?? 0} build
            {carsQuery.data?.length === 1 ? '' : 's'} in rotation
          </p>
        </div>

        <button
          className='btn btn-primary'
          onClick={() => setAdding(previous => !previous)}
        >
          {adding ? 'Close form' : '+ Add a build'}
        </button>
      </div>

      {/* Add form */}
      {adding ? (
        <div className='panel mb-8 p-6'>
          <CarForm
            submitLabel='Add to garage'
            onCancel={() => setAdding(false)}
            onSubmit={async payload => {
              await createCar.mutateAsync(payload)
            }}
          />
        </div>
      ) : null}

      {/* Loading */}
      {carsQuery.isLoading ? (
        <p className='font-mono text-sm text-slate-500'>
          Opening your garage...
        </p>
      ) : null}

      {/* Error */}
      {carsQuery.isError ? (
        <div className='panel border-red-900/50 p-6'>
          <p className='text-sm text-red-400'>
            Could not load your garage. Make sure the API is running.
          </p>
        </div>
      ) : null}

      {/* Empty state */}
      {carsQuery.data?.length === 0 ? (
        <div className='panel hero-gradient p-12'>
          <p className='font-display text-3xl font-semibold uppercase text-white'>
            Every build starts somewhere.
          </p>
          <p className='mt-3 max-w-lg text-sm text-slate-400'>
            Add your first car. Give it a name, tell us what it is, and start
            documenting what you do to it.
          </p>
          <button
            className='btn btn-primary mt-6'
            onClick={() => setAdding(true)}
          >
            Start your first build
          </button>
        </div>
      ) : null}

      {/* Garage grid */}
      <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
        {carsQuery.data?.map(car => (
          <Link
            key={car.id}
            to={`/cars/${car.id}`}
            className='group panel overflow-hidden transition hover:border-boost-500/40'
          >
            <div className='overflow-hidden'>
              <CoverImage car={car} />
            </div>

            <div className='p-5'>
              <div className='mb-3 flex flex-wrap gap-2'>
                {car.status ? (
                  <Badge tone='orange'>{humanizeEnum(car.status)}</Badge>
                ) : null}

                {car.discipline ? (
                  <Badge>{humanizeEnum(car.discipline)}</Badge>
                ) : null}
              </div>

              <h2 className='font-display text-2xl font-semibold uppercase leading-tight text-white'>
                {car.nickname || `${car.make} ${car.model}`}
              </h2>

              <p className='mt-1 text-xs text-slate-500'>
                {car.year} {car.make} {car.model}
                {car.trim ? ` · ${car.trim}` : ''}
              </p>

              <div className='mt-5 flex items-end justify-between border-t border-carbon-800 pt-4'>
                <div>
                  <p className='text-[10px] uppercase tracking-widest text-slate-600'>
                    Stock power
                  </p>
                  <p className='font-mono text-xl text-white'>
                    {car.stock_hp ?? '—'}
                    <span className='ml-1 text-xs text-slate-500'>hp</span>
                  </p>
                </div>

                <div className='text-right'>
                  <p className='text-[10px] uppercase tracking-widest text-slate-600'>
                    Photos
                  </p>
                  <p className='font-mono text-xl text-slate-300'>
                    {car.photos?.length ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
