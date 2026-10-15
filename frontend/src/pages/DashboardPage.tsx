import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Car } from '../lib/types'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()

  const [year, setYear] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [formError, setFormError] = useState('')

  const carsQuery = useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      const response = await api.get<Car[]>('/cars')
      return response.data
    },
  })

  const createCarMutation = useMutation({
    mutationFn: async (data: { year: number; make: string; model: string }) => {
      const response = await api.post<Car>('/cars', data)
      return response.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['cars'],
      })
    },
  })

  async function handleCreateCar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setFormError('')

    if (!year || !make || !model) {
      setFormError('Year, make, and model are required.')
      return
    }

    try {
      await createCarMutation.mutateAsync({
        year: Number(year),
        make,
        model,
      })

      setYear('')
      setMake('')
      setModel('')
    } catch {
      setFormError('Failed to create car.')
    }
  }

  return (
    <div className='page'>
      <div className='header'>
        <div>
          <h1 className='title'>Dashboard</h1>
          <p className='subtitle'>Signed in as {user?.username ?? 'user'}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to='/'>
            <button className='secondary-button'>Home</button>
          </Link>

          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div className='card' style={{ marginBottom: '24px' }}>
        <h2>Add a car</h2>

        {formError ? <p className='error'>{formError}</p> : null}

        <form onSubmit={handleCreateCar}>
          <div className='form-row'>
            <label>
              Year
              <input
                type='number'
                min='1900'
                max='2100'
                value={year}
                onChange={event => setYear(event.target.value)}
                required
              />
            </label>

            <label>
              Make
              <input
                type='text'
                placeholder='Toyota'
                value={make}
                onChange={event => setMake(event.target.value)}
                required
              />
            </label>

            <label>
              Model
              <input
                type='text'
                placeholder='GR Supra'
                value={model}
                onChange={event => setModel(event.target.value)}
                required
              />
            </label>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button type='submit' disabled={createCarMutation.isPending}>
              {createCarMutation.isPending ? 'Adding...' : 'Add car'}
            </button>
          </div>
        </form>
      </div>

      <h2>Your garage</h2>

      {carsQuery.isLoading ? (
        <p className='muted'>Loading cars...</p>
      ) : carsQuery.isError ? (
        <p className='error'>Failed to load cars.</p>
      ) : carsQuery.data?.length === 0 ? (
        <div className='card'>
          <p className='muted'>No cars yet. Add your first car above.</p>
        </div>
      ) : (
        <div className='grid'>
          {carsQuery.data?.map(car => (
            <Link
              key={car.id}
              to={`/cars/${car.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className='card'>
                <h3 style={{ marginTop: 0 }}>
                  {car.nickname || `${car.year} ${car.make} ${car.model}`}
                </h3>

                <p className='muted'>
                  {car.year} {car.make} {car.model}
                </p>

                {car.trim ? <p className='muted'>Trim: {car.trim}</p> : null}

                {car.stock_hp ? (
                  <p className='muted'>Stock HP: {car.stock_hp}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
