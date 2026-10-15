import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setSubmitting(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Login failed. Check your email and password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='page'>
      <div className='header'>
        <div>
          <h1 className='title'>Login</h1>
          <p className='subtitle'>Sign in to your garage.</p>
        </div>
      </div>

      <form className='form card' onSubmit={handleSubmit}>
        {error ? <p className='error'>{error}</p> : null}

        <label>
          Email
          <input
            type='email'
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type='password'
            value={password}
            onChange={event => setPassword(event.target.value)}
            required
          />
        </label>

        <button type='submit' disabled={submitting}>
          {submitting ? 'Signing in...' : 'Login'}
        </button>

        <p className='muted'>
          Need an account? <Link to='/register'>Register</Link>
        </p>
      </form>
    </div>
  )
}
