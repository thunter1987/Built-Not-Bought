import { Link } from 'react-router-dom'

import { useAuth } from '../lib/auth'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className='page'>
      <div className='header'>
        <div>
          <h1 className='title'>Built Not Bought</h1>
          <p className='subtitle'>Document the build. Track the performance.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {user ? (
            <>
              <Link to='/dashboard'>
                <button>Dashboard</button>
              </Link>

              <button className='secondary-button' onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to='/login'>
                <button>Login</button>
              </Link>

              <Link to='/register'>
                <button className='secondary-button'>Register</button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className='card'>
        <h2>Your garage, your mods, your numbers.</h2>

        <p className='muted'>
          Built Not Bought is a garage and performance tracking app for car
          enthusiasts. Add your cars, log modifications, upload photos, and
          track performance results over time.
        </p>
      </div>
    </div>
  )
}
