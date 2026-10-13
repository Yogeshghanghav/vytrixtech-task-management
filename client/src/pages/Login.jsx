import { useState } from 'react'
import api from '../api'

function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await api.post('/auth/login', { email, password })

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      onLogin(data.user)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
            <rect x="2" y="4" width="20" height="4" rx="1" fill="#0f766e" />
            <rect x="2" y="10" width="14" height="4" rx="1" fill="#2dd4bf" />
            <rect x="2" y="16" width="8" height="4" rx="1" fill="#99f6e4" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-slate-900">TeamFlow</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex h-1" aria-hidden="true">
            <span className="flex-1 bg-slate-400" />
            <span className="flex-1 bg-amber-500" />
            <span className="flex-1 bg-emerald-600" />
          </div>

          <div className="px-7 pb-8 pt-7 sm:px-9">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-600">
              Sign in to see your projects and tasks.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-800">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-slate-800">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-pressed={showPassword}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onShowRegister}
            className="font-semibold text-teal-700 hover:text-teal-800"
          >
            Create one
          </button>
        </p>
      </div>
    </main>
  )
}

export default Login