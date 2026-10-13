import { useState } from 'react'
import api from '../api'

function Register({ onRegistered, onShowLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/register', { name: name.trim(), email, password })

      setCreated(true)
      if (onRegistered) onRegistered()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20'

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
            {created ? (
              <>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  You're all set
                </h1>
                <p className="mt-1.5 text-sm text-slate-600">Your account has been created.</p>

                <p
                  role="status"
                  className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800"
                >
                  New accounts start as developers. A project manager or admin can give you
                  more access.
                </p>

                <button
                  type="button"
                  onClick={onShowLogin}
                  className="mt-5 h-11 w-full rounded-lg bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                >
                  Continue to sign in
                </button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Create your account
                </h1>
                <p className="mt-1.5 text-sm text-slate-600">It takes less than a minute.</p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-800">
                      Full name
                    </label>
                    <input
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-800">
                      Work email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      autoComplete="email"
                      className={inputClass}
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
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className={inputClass}
                    />
                    <p className="mt-1.5 text-xs text-slate-500">At least 6 characters</p>
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
                    {loading ? 'Creating account...' : 'Create account'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onShowLogin}
            className="font-semibold text-teal-700 hover:text-teal-800"
          >
            Sign in
          </button>
        </p>
      </div>
    </main>
  )
}

export default Register