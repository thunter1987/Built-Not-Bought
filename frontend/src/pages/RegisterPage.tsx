import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../lib/auth'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setSubmitting(true)

    try {
      await register(email, username, password)
      navigate('/dashboard')
    } catch {
      setError('Registration failed. Try a different email or username.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='page'>
      <div className='header'>
        <div>
          <h1 className='title'>Register</h1>
          <p className='subtitle'>Create your Built Not Bought account.</p>
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
          Username
          <input
            type='text'
            value={username}
            onChange={event => setUsername(event.target.value)}
            minLength={3}
            maxLength={30}
            required
          />
        </label>

        <label>
          Password
          <input
            type='password'
            value={password}
            onChange={event => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        <button type='submit' disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>

        <p className='muted'>
          Already have an account? <Link to='/login'>Login</Link>
        </p>
      </form>
    </div>
  )
}
