import type { ChangeEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '../lib/api'
import type { Car, CarPhoto } from '../lib/types'

export default function CarDetailPage() {
  const { carId } = useParams<{ carId: string }>()
  const queryClient = useQueryClient()

  const carQuery = useQuery({
    queryKey: ['car', carId],
    queryFn: async () => {
      const response = await api.get<Car>(`/cars/${carId}`)
      return response.data
    },
    enabled: Boolean(carId),
  })

  const uploadPhotoMutation = useMutation({
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
      void queryClient.invalidateQueries({
        queryKey: ['car', carId],
      })
    },
  })

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      await api.delete(`/cars/${carId}/photos/${photoId}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['car', carId],
      })
    },
  })

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    uploadPhotoMutation.mutate(file)

    event.target.value = ''
  }

  if (carQuery.isLoading) {
    return <div className='page'>Loading car...</div>
  }

  if (carQuery.isError) {
    return <div className='page error'>Failed to load car.</div>
  }

  const car = carQuery.data

  if (!car) {
    return <div className='page'>Car not found.</div>
  }

  return (
    <div className='page'>
      <div className='header'>
        <div>
          <h1 className='title'>
            {car.nickname || `${car.year} ${car.make} ${car.model}`}
          </h1>

          <p className='subtitle'>
            {car.year} {car.make} {car.model}
          </p>
        </div>

        <Link to='/dashboard'>
          <button className='secondary-button'>Back to garage</button>
        </Link>
      </div>

      <div className='card'>
        <h2>Car details</h2>

        <div className='detail-grid'>
          <div>
            <p className='muted'>Year</p>
            <p>{car.year}</p>
          </div>

          <div>
            <p className='muted'>Make</p>
            <p>{car.make}</p>
          </div>

          <div>
            <p className='muted'>Model</p>
            <p>{car.model}</p>
          </div>

          {car.trim ? (
            <div>
              <p className='muted'>Trim</p>
              <p>{car.trim}</p>
            </div>
          ) : null}

          {car.engine_code ? (
            <div>
              <p className='muted'>Engine</p>
              <p>{car.engine_code}</p>
            </div>
          ) : null}

          {car.drivetrain ? (
            <div>
              <p className='muted'>Drivetrain</p>
              <p>{car.drivetrain}</p>
            </div>
          ) : null}

          {car.transmission ? (
            <div>
              <p className='muted'>Transmission</p>
              <p>{car.transmission}</p>
            </div>
          ) : null}

          {car.curb_weight_lb ? (
            <div>
              <p className='muted'>Weight</p>
              <p>{car.curb_weight_lb} lb</p>
            </div>
          ) : null}

          {car.stock_hp ? (
            <div>
              <p className='muted'>Stock HP</p>
              <p>{car.stock_hp}</p>
            </div>
          ) : null}

          {car.stock_torque_ftlb ? (
            <div>
              <p className='muted'>Stock Torque</p>
              <p>{car.stock_torque_ftlb} lb-ft</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className='detail-section card'>
        <h2>Photos</h2>

        {uploadPhotoMutation.isError ? (
          <p className='error'>Photo upload failed.</p>
        ) : null}

        {deletePhotoMutation.isError ? (
          <>
            <p className='error'>Failed...</p>
            <p className='error'>Photo Not Deleted</p>
          </>
        ) : null}

        <div style={{ marginBottom: '16px' }}>
          <input
            type='file'
            accept='image/png,image/jpeg,image/webp,image/gif'
            onChange={handleFileChange}
            disabled={uploadPhotoMutation.isPending}
          />
        </div>

        {uploadPhotoMutation.isPending ? (
          <p className='muted'>Uploading photo...</p>
        ) : null}

        {car.photos && car.photos.length > 0 ? (
          <div className='photo-grid'>
            {car.photos.map(photo => (
              <div key={photo.id} className='photo-card'>
                <img src={photo.url_path} alt={photo.original_filename} />

                <div className='photo-actions'>
                  <span className='photo-filename'>
                    {photo.original_filename}
                  </span>

                  <button
                    className='danger-button'
                    onClick={() => deletePhotoMutation.mutate(photo.id)}
                    disabled={deletePhotoMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='muted'>No photos yet. Upload one above.</p>
        )}
      </div>

      <div className='detail-section card'>
        <h2>Specs</h2>

        <pre className='pre'>{JSON.stringify(car.specs, null, 2)}</pre>
      </div>
    </div>
  )
}
