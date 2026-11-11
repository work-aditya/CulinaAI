import React, { useState } from 'react'
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
  KeyRound,
  Sparkles,
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onUserChange: (user: any) => void
}

type AuthMode = 'signin' | 'signup' | 'forgot'

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserChange,
}) => {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen) return null

  // Password Strength Criteria
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial

  const resetForm = () => {
    setErrorMsg('')
    setSuccessMsg('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleModeChange = (newMode: AuthMode) => {
    resetForm()
    setMode(newMode)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.')
      setLoading(false)
      return
    }

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setSuccessMsg(
          'Demo Mode: A password reset link has been dispatched to ' + email.trim() + '.'
        )
        setLoading(false)
      }, 500)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/`,
      })
      if (error) throw error

      setSuccessMsg(
        'Password reset email sent! Check your inbox for instructions to reset your password.'
      )
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (mode === 'signup') {
      if (!isPasswordValid) {
        setErrorMsg('Please satisfy all password security requirements before proceeding.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify and try again.')
        return
      }
    }

    setLoading(true)

    if (!isSupabaseConfigured) {
      // Demo / Offline Auth Mode when Supabase credentials are not configured
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
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
        if (error) throw error
        if (data.user) {
          onUserChange(data.user)
          // Trigger welcome email via Resend Edge Function
          supabase.functions
            .invoke('send-email', {
              body: { to: email.trim(), type: 'welcome' },
            })
            .catch(() => { })

          setSuccessMsg('Account created successfully! Check your email for confirmation.')
          setTimeout(() => onClose(), 1200)
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
        className="relative bg-[#FAF8F3] w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#24251F]/10 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[#24251F]/5 text-[#77796F] hover:text-[#24251F] transition-colors cursor-pointer"
          aria-label="Close dialog"
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
              className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors border border-red-200/50 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : mode === 'forgot' ? (
          /* Forgot Password View */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#E6A45B]/20 text-[#24251F] flex items-center justify-center mx-auto mb-3 shadow-xs">
                <KeyRound className="w-6 h-6 text-[#557A46]" />
              </div>
              <h2 className="font-editorial text-2xl font-bold text-[#24251F]">
                Reset Your Password
              </h2>
              <p className="text-xs text-[#77796F] mt-1">
                Enter your registered chef email and we'll send you a secure link to reset your password.
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

            <form onSubmit={handleForgotPassword} className="space-y-4">
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
                    placeholder="EMAIL"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#24251F]/10 text-sm text-[#24251F] placeholder:text-[#77796F]/60 focus:outline-none focus:border-[#557A46] focus:ring-1 focus:ring-[#557A46]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#557A46] hover:bg-[#456538] text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => handleModeChange('signin')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#557A46] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          /* Sign In & Sign Up Form */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#557A46] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Lock className="w-6 h-6 text-[#FAF8F3]" />
              </div>
              <h2 className="font-editorial text-2xl font-bold text-[#24251F]">
                {mode === 'signup' ? 'Create Chef Profile' : 'Welcome to CulinaAI'}
              </h2>
              <p className="text-xs text-[#77796F] mt-1">
                {mode === 'signup'
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
              {/* Email Field */}
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
                    placeholder="EMAIL"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#24251F]/10 text-sm text-[#24251F] placeholder:text-[#77796F]/60 focus:outline-none focus:border-[#557A46] focus:ring-1 focus:ring-[#557A46]"
                  />
                </div>
              </div>

              {/* Password Field with Hide / Unhide Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#77796F] uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => handleModeChange('forgot')}
                      className="text-[11px] font-semibold text-[#557A46] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#24251F]/10 text-sm text-[#24251F] placeholder:text-[#77796F]/60 focus:outline-none focus:border-[#557A46] focus:ring-1 focus:ring-[#557A46]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 rounded-lg text-[#77796F] hover:text-[#24251F] hover:bg-[#24251F]/5 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist (Shown in Sign Up Mode) */}
              {mode === 'signup' && (
                <div className="p-3 bg-white/80 rounded-xl border border-[#24251F]/8 space-y-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-[#77796F] uppercase tracking-wider">
                      Password Requirements
                    </span>
                    {isPasswordValid && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#557A46] bg-[#557A46]/10 px-1.5 py-0.5 rounded-full">
                        <Sparkles className="w-2.5 h-2.5" />
                        Strong
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                    <div
                      className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#557A46] font-medium' : 'text-[#77796F]'
                        }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${hasMinLength ? 'bg-[#557A46] text-white' : 'border border-[#77796F]/40'
                          }`}
                      >
                        {hasMinLength && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span>At least 8 characters</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${hasUppercase ? 'text-[#557A46] font-medium' : 'text-[#77796F]'
                        }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${hasUppercase ? 'bg-[#557A46] text-white' : 'border border-[#77796F]/40'
                          }`}
                      >
                        {hasUppercase && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span>One uppercase (A-Z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${hasLowercase ? 'text-[#557A46] font-medium' : 'text-[#77796F]'
                        }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${hasLowercase ? 'bg-[#557A46] text-white' : 'border border-[#77796F]/40'
                          }`}
                      >
                        {hasLowercase && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span>One lowercase (a-z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${hasNumber ? 'text-[#557A46] font-medium' : 'text-[#77796F]'
                        }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${hasNumber ? 'bg-[#557A46] text-white' : 'border border-[#77796F]/40'
                          }`}
                      >
                        {hasNumber && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span>One number (0-9)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 sm:col-span-2 ${hasSpecial ? 'text-[#557A46] font-medium' : 'text-[#77796F]'
                        }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${hasSpecial ? 'bg-[#557A46] text-white' : 'border border-[#77796F]/40'
                          }`}
                      >
                        {hasSpecial && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span>One special symbol (!@#$%^&*...)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Password Field (Sign Up Only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[#77796F] mb-1.5 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#77796F] absolute left-3.5 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-[#24251F]/10 text-sm text-[#24251F] placeholder:text-[#77796F]/60 focus:outline-none focus:border-[#557A46] focus:ring-1 focus:ring-[#557A46]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 p-1 rounded-lg text-[#77796F] hover:text-[#24251F] hover:bg-[#24251F]/5 transition-colors cursor-pointer"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (mode === 'signup' && !isPasswordValid)}
                className="w-full py-3 rounded-xl bg-[#557A46] hover:bg-[#456538] text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading
                  ? 'Authenticating...'
                  : mode === 'signup'
                    ? 'Create Free Account'
                    : 'Sign In'}
              </button>
            </form>

            {/* Toggle Sign In / Sign Up */}
            <div className="mt-6 text-center text-xs text-[#77796F]">
              {mode === 'signup' ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeChange('signin')}
                    className="font-semibold text-[#557A46] hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeChange('signup')}
                    className="font-semibold text-[#557A46] hover:underline cursor-pointer"
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
