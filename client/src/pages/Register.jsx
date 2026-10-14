
import { useState } from 'react'
import api from '../api'

function Register({ onRegistered, onShowLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
      })

      setMessage('Account created successfully. You can now sign in.')
      setName('')
      setEmail('')
      setPassword('')

      if (onRegistered) onRegistered()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7fb] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-indigo-100/50">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">
            T
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Join your team and start collaborating.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onShowLogin}
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Sign in
          </button>
        </p>
      </section>
    </main>
  )
}

export default Register
