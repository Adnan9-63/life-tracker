import React, { useState } from 'react'
import { Lock, Loader2, Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordPage() {
  const { updatePassword, clearPasswordRecovery, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setDone(true)
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#09090b] to-[#09090b]">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Life Tracker</h1>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-zinc-100">Set a new password</h2>

          {error && (
            <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          {done ? (
            <div className="space-y-4">
              <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5">
                Password updated. Please log in again with your new password.
              </div>
              <button
                onClick={async () => { await signOut(); clearPasswordRecovery() }}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all"
              >
                Continue to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
