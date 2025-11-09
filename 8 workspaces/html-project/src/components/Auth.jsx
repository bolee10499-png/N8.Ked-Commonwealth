import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Shield, Key, Loader2, AlertCircle, Eye, EyeOff, X, RefreshCw, Wifi, WifiOff } from 'lucide-react';

// Constants
const API_URL = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

const CONSTANTS = {
  REQUEST_TIMEOUT: 10000,
  HEALTH_CHECK_TIMEOUT: 3000,
  REDIRECT_DELAY: 2000,
  AUTH_STORAGE_KEY: 'depression_auth',
  AUTH_PASSWORD: 'demonseatkids2024',
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

const DISPOSABLE_DOMAINS = ['tempmail.com', 'throwaway.email', '10minutemail.com'];

const s = {
  overlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: 'rgba(0,0,0,0.95)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 1000 
  },
  modal: { 
    background: 'linear-gradient(135deg,rgba(255,0,0,0.1),rgba(0,0,0,0.9))', 
    border: '2px solid #f00', 
    borderRadius: '20px', 
    padding: '3rem', 
    maxWidth: '450px', 
    width: '90%', 
    boxShadow: '0 20px 60px rgba(255,0,0,0.5)',
    maxHeight: '90vh',
    overflowY: 'auto'
  }
};

// Email validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isDisposableEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.some(d => domain?.includes(d));
};

// Password strength
const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
  return { score: strength, max: 6 };
};

const getStrengthColor = (score) => {
  if (score <= 2) return 'bg-red-500';
  if (score <= 4) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getStrengthText = (score) => {
  if (score <= 2) return 'Weak';
  if (score <= 4) return 'Medium';
  return 'Strong';
};

export default function Auth({ onClose, onAuth }) {
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pin, setPin] = useState('');
  const [requiresPIN, setRequiresPIN] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showPassword, setShowPassword] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const firstInputRef = useRef(null);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
    
    // Auto-focus first input
    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onClose]);

  const checkBackendHealth = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONSTANTS.HEALTH_CHECK_TIMEOUT);
      
      const response = await fetch(`${API_URL}/api/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setBackendOnline(response.ok);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Backend health check failed:', error);
      }
      setBackendOnline(false);
    }
  };

  // Fetch with retry logic
  const fetchWithRetry = async (url, options, currentRetry = 0) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONSTANTS.REQUEST_TIMEOUT);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (currentRetry < CONSTANTS.MAX_RETRIES && error.name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, CONSTANTS.RETRY_DELAY));
        setRetryCount(currentRetry + 1);
        return fetchWithRetry(url, options, currentRetry + 1);
      }
      throw error;
    }
  };

  // Client-side validation
  const validateInput = () => {
    if (!EMAIL_REGEX.test(email)) {
      setErr('Invalid email format');
      return false;
    }
    
    if (isDisposableEmail(email)) {
      setErr('Disposable email addresses are not allowed');
      return false;
    }
    
    if (mode === 'signup') {
      if (!username || username.length < 3) {
        setErr('Username must be at least 3 characters');
        return false;
      }
      if (!name || name.length < 2) {
        setErr('Name must be at least 2 characters');
        return false;
      }
      const strength = calculatePasswordStrength(password);
      if (strength.score < 4) {
        setErr('Password is too weak. Please use a stronger password.');
        return false;
      }
    }
    
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    setRetryCount(0);
    
    if (!validateInput()) {
      setLoading(false);
      return;
    }

    if (!isOnline) {
      setErr('No internet connection. Please check your network.');
      setLoading(false);
      return;
    }

    if (backendOnline === false) {
      setErr('Backend server is offline. Please start it first.');
      setLoading(false);
      return;
    }
    
    try {
      const r = await fetchWithRetry(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });
      
      if (!r.ok) {
        const d = await r.json();
        if (r.status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        }
        throw new Error(d.error || 'Login failed');
      }
      
      const d = await r.json();
      
      if (d.requires2FA) {
        setStep('2fa');
        setRequiresPIN(d.requiresPIN || false);
        setMsg(d.message);
        setLoading(false);
        return;
      }
      
      localStorage.setItem(CONSTANTS.TOKEN_KEY, d.token);
      localStorage.setItem(CONSTANTS.USER_KEY, JSON.stringify(d.user));
      localStorage.setItem(CONSTANTS.AUTH_STORAGE_KEY, CONSTANTS.AUTH_PASSWORD);
      onAuth(d.user);
      onClose();
    } catch (e) {
      if (e.name === 'AbortError') {
        setErr('Request timeout - backend may be slow or offline');
      } else {
        setErr(e.message || 'Network error - check if backend is running on port 5000');
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    setRetryCount(0);
    
    if (!validateInput()) {
      setLoading(false);
      return;
    }
    
    try {
      const r = await fetchWithRetry(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username, name })
      });
      
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || 'Registration failed');
      }
      
      const d = await r.json();
      setStep('verify-email');
      setMsg(`${d.message} (Container: ${d.container}, Slot: ${d.slot})`);
    } catch (e) {
      if (e.name === 'AbortError') {
        setErr('Request timeout - backend may be slow or offline');
      } else {
        setErr(e.message || 'Network error - check if backend is running');
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Register error:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setErr('');
    setLoading(true);
    
    try {
      const r = await fetchWithRetry(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || 'Failed to resend code');
      }
      
      setMsg('✅ New verification code sent!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    
    if (verificationCode.length !== 6) {
      setErr('Verification code must be 6 digits');
      setLoading(false);
      return;
    }
    
    try {
      const r = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });
      
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || 'Verification failed');
      }
      
      const d = await r.json();
      setMsg('✅ Email verified! Redirecting to login...');
      setTimeout(() => {
        setMode('login');
        setStep('credentials');
        setMsg('');
      }, CONSTANTS.REDIRECT_DELAY);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    
    if (twoFactorCode.length !== 6) {
      setErr('2FA code must be 6 digits');
      setLoading(false);
      return;
    }
    
    if (requiresPIN && (!pin || pin.length !== 6)) {
      setErr('System admin PIN must be 6 digits');
      setLoading(false);
      return;
    }
    
    try {
      const r = await fetch(`${API_URL}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: twoFactorCode, pin: pin || undefined })
      });
      
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || '2FA verification failed');
      }
      
      const d = await r.json();
      localStorage.setItem(CONSTANTS.TOKEN_KEY, d.token);
      localStorage.setItem(CONSTANTS.USER_KEY, JSON.stringify(d.user));
      localStorage.setItem(CONSTANTS.AUTH_STORAGE_KEY, CONSTANTS.AUTH_PASSWORD);
      onAuth(d.user);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErr('');
    setLoading(true);
    setMsg('🔄 Connecting to Google...');
    
    setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/api/auth/google-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ googleToken: 'simulated-token' })
        });
        
        if (!r.ok) {
          const d = await r.json();
          throw new Error(d.error || 'Google login failed');
        }
        
        const d = await r.json();
        localStorage.setItem(CONSTANTS.TOKEN_KEY, d.token);
        localStorage.setItem(CONSTANTS.USER_KEY, JSON.stringify(d.user));
        localStorage.setItem(CONSTANTS.AUTH_STORAGE_KEY, CONSTANTS.AUTH_PASSWORD);
        onAuth(d.user);
        onClose();
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const passwordStrength = password ? calculatePasswordStrength(password) : null;

  return (
    <div style={s.overlay} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={s.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-labelledby="auth-title"
        aria-describedby="auth-description"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close dialog"
          disabled={loading}
        >
          <X size={24} />
        </button>

        {/* Network Status */}
        {!isOnline && (
          <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500 rounded-lg flex items-center gap-2">
            <WifiOff size={16} className="text-orange-500" />
            <span className="text-orange-500 text-sm">No internet connection</span>
          </div>
        )}

        {/* Backend Status Indicator */}
        {backendOnline === false && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-red-500 text-sm">Backend offline - Start server first</span>
            <button
              onClick={checkBackendHealth}
              className="ml-auto text-red-500 hover:text-red-400"
              disabled={loading}
              aria-label="Retry backend connection"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}
        
        {backendOnline === true && (
          <div className="mb-4 p-2 bg-green-500/10 border border-green-500 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-500 text-xs">Backend connected</span>
            {isOnline && <Wifi size={12} className="ml-auto text-green-500" />}
          </div>
        )}

        {/* Retry Counter */}
        {retryCount > 0 && (
          <div className="mb-4 p-2 bg-blue-500/10 border border-blue-500 rounded-lg text-center">
            <span className="text-blue-500 text-xs">Retry attempt {retryCount}/{CONSTANTS.MAX_RETRIES}</span>
          </div>
        )}

        <h2 id="auth-title" className="text-3xl font-bold mb-6 bg-gradient-to-r from-demon-red to-red-500 bg-clip-text text-transparent text-center">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>

        {step === 'credentials' && (
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            {mode === 'signup' && (
              <>
                <div className="mb-4">
                  <label htmlFor="name-input" className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                    <User size={16} /> Full Name
                  </label>
                  <input
                    id="name-input"
                    ref={firstInputRef}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-demon-red/50"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="name"
                    aria-required="true"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="username-input" className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                    <User size={16} /> Username
                  </label>
                  <div className="relative">
                    <input
                      id="username-input"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-demon-red/50"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="username"
                      aria-required="true"
                    />
                    {username && (
                      <button
                        type="button"
                        onClick={() => setUsername('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        aria-label="Clear username"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="mb-4">
              <label htmlFor="email-input" className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                <Mail size={16} /> Email
              </label>
              <div className="relative">
                <input
                  id="email-input"
                  ref={mode === 'login' ? firstInputRef : null}
                  type="email"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-demon-red/50"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  aria-required="true"
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    aria-label="Clear email"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="password-input" className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                <Lock size={16} /> Password
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-20 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-demon-red/50"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  aria-required="true"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  {password && (
                    <button
                      type="button"
                      onClick={() => setPassword('')}
                      className="text-gray-400 hover:text-white"
                      aria-label="Clear password"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {mode === 'signup' && passwordStrength && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Password strength:</span>
                    <span className={passwordStrength.score <= 2 ? 'text-red-500' : passwordStrength.score <= 4 ? 'text-yellow-500' : 'text-green-500'}>
                      {getStrengthText(passwordStrength.score)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / passwordStrength.max) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {mode === 'login' && (
              <div className="mb-4 flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-white/5 text-demon-red focus:ring-demon-red"
                />
                <label htmlFor="remember-me" className="text-sm text-gray-400">
                  Remember me for 30 days
                </label>
              </div>
            )}

            <AnimatePresence>
              {err && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm mb-4 flex items-center gap-2"
                >
                  <AlertCircle size={14} />
                  {err}
                </motion.div>
              )}
              {msg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-green-500 text-sm mb-4"
                >
                  ✅ {msg}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-demon-red to-red-700 hover-force font-semibold mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading || backendOnline === false || !isOnline}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Login' : 'Sign Up'
              )}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-semibold disabled:opacity-50"
              disabled={loading || backendOnline === false || !isOnline}
            >
              Continue with Google
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setErr('');
                  setMsg('');
                }}
                className="text-demon-red hover:underline disabled:opacity-50"
                disabled={loading}
              >
                {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Login'}
              </button>
            </div>
          </form>
        )}

        {step === 'verify-email' && (
          <form onSubmit={handleVerifyEmail}>
            <div className="text-center mb-6">
              <Mail size={48} className="mx-auto mb-4 text-demon-red" />
              <p className="text-gray-400 text-sm">{msg}</p>
            </div>
            <div className="mb-4">
              <label htmlFor="verification-code" className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                <Shield size={16} /> Verification Code
              </label>
              <input
                id="verification-code"
                ref={firstInputRef}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-demon-red/50 text-center text-2xl tracking-widest"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                required
                disabled={loading}
                placeholder="000000"
                autoComplete="one-time-code"
                inputMode="numeric"
                aria-required="true"
              />
            </div>
            {err && (
              <div className="text-red-500 text-sm mb-4 flex items-center gap-2">
                <AlertCircle size={14} />
                {err}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-demon-red to-red-700 hover-force font-semibold mb-3 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
            <button
              type="button"
              onClick={handleResendVerification}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm flex items-center justify-center gap-2"
              disabled={loading}
            >
              <RefreshCw size={14} />
              Resend Code
            </button>
          </form>
        )}

        {step === '2fa' && (
          <form onSubmit={handleVerify2FA} onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleVerify2FA(e);
            }
          }}>
            <div className="text-center mb-6">
              <Shield size={48} className="mx-auto mb-4 text-demon-red" />
              <p className="text-gray-400">{msg}</p>
            </div>
            <div className="mb-4">
              <label htmlFor="2fa-code" className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                <Shield size={16} /> 2FA Code
              </label>
              <input
                id="2fa-code"
                ref={firstInputRef}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-demon-red/50 text-center text-2xl tracking-widest"
                value={twoFactorCode}
                onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                required
                disabled={loading}
                placeholder="000000"
                autoComplete="one-time-code"
                inputMode="numeric"
                aria-required="true"
              />
            </div>
            {requiresPIN && (
              <div className="mb-4">
                <label htmlFor="admin-pin" className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                  <Key size={16} /> System Admin PIN
                </label>
                <input
                  id="admin-pin"
                  type="password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-demon-red/50 text-center text-xl tracking-widest"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  placeholder="••••••"
                  required
                  disabled={loading}
                  autoComplete="off"
                  inputMode="numeric"
                  aria-required="true"
                />
              </div>
            )}
            {err && (
              <div className="text-red-500 text-sm mb-4 flex items-center gap-2">
                <AlertCircle size={14} />
                {err}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-demon-red to-red-700 hover-force font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Login'
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}