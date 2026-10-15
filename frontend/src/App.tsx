import { Navigate, Route, Routes } from 'react-router-dom'
import {type ReactNode } from 'react'
import { useAuth } from './lib/auth'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CarDetailPage from './pages/CarDetailPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className='page'>Loading...</div>
  }
  if (!user) {
    return <Navigate to='/login' replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />

      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path='/cars/:carId'
        element={
          <ProtectedRoute>
            <CarDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}
