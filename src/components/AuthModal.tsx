import React, { useState } from 'react'
import { X, Lock, Mail, User, ShieldCheck, AlertCircle } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onUserChange: (user: any) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserChange,
}) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen) return null

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    if (!isSupabaseConfigured) {
      // Demo / Offline Auth Mode when Supabase credentials are not yet configured
      setTimeout(() => {
        const demoUser = {
          id: 'demo-user-123',
          email: email.trim() || 'chef@culina.ai',
          user_metadata: { name: email.split('@')[0] || 'Chef' },
        }
        localStorage.setItem('culina_demo_user', JSON.stringify(demoUser))
        onUserChange(demoUser)
        setLoading(false)
        onClose()
      }, 400)
      return
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (error) throw error
        if (data.user) {
          onUserChange(data.user)
          setSuccessMsg('Account created successfully! Check your email if confirmation is required.')
          setTimeout(() => onClose(), 1000)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
        if (data.user) {
          onUserChange(data.user)
          onClose()
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem('culina_demo_user')
    onUserChange(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-[#FAF8F3] w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#24251F]/10 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#24251F]/5 text-[#77796F] hover:text-[#24251F] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          /* User Profile & Sign Out View */
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-3xl bg-[#557A46]/10 text-[#557A46] flex items-center justify-center mx-auto">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-editorial text-2xl font-bold text-[#24251F]">
                Welcome, Chef
              </h2>
              <p className="text-xs text-[#77796F] mt-1">{user.email}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#24251F]/8 text-xs text-[#557A46] flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Your recipes and grocery items sync automatically
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors border border-red-200/50"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#557A46] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Lock className="w-6 h-6 text-[#FAF8F3]" />
              </div>
              <h2 className="font-editorial text-2xl font-bold text-[#24251F]">
                {isSignUp ? 'Create Chef Profile' : 'Welcome to CulinaAI'}
              </h2>
              <p className="text-xs text-[#77796F] mt-1">
                {isSignUp
                  ? 'Sign up to sync your bookmarks and grocery list across devices'
                  : 'Sign in to access your saved recipes and meal collections'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#77796F] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="chef@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#24251F]/10 text-sm text-[#24251F] placeholder:text-[#77796F]/60 focus:outline-none focus:border-[#557A46] focus:ring-1 focus:ring-[#557A46]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#77796F] mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#24251F]/10 text-sm text-[#24251F] placeholder:text-[#77796F]/60 focus:outline-none focus:border-[#557A46] focus:ring-1 focus:ring-[#557A46]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#557A46] hover:bg-[#456538] text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
              >
                {loading
                  ? 'Authenticating...'
                  : isSignUp
                  ? 'Create Free Account'
                  : 'Sign In'}
              </button>
            </form>

            {/* Toggle Sign In / Sign Up */}
            <div className="mt-6 text-center text-xs text-[#77796F]">
              {isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false)
                      setErrorMsg('')
                    }}
                    className="font-semibold text-[#557A46] hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true)
                      setErrorMsg('')
                    }}
                    className="font-semibold text-[#557A46] hover:underline"
                  >
                    Create one
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

