import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, QrCode } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/motion/variants';
import { useAuth } from '@/providers/auth-provider';

declare global {
  interface Window {
    google?: any;
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, googleLogin, verify2FA } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('sarah.kim@trustride.ai');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // 2FA Verification Modal State
  const [show2FA, setShow2FA] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  const demoAccounts = [
    { email: 'admin@trustride.ai', pass: 'Admin@123', label: 'Administrator' },
    { email: 'sarah.kim@trustride.ai', pass: 'Admin@123', label: 'Security Officer' },
    { email: 'aisha.khan@trustride.ai', pass: 'Admin@123', label: 'Operations Manager' },
    { email: 'rajesh.kumar@trustride.ai', pass: 'Driver@123', label: 'Driver' },
    { email: 'viewer@trustride.ai', pass: 'Viewer@123', label: 'Viewer' },
  ];

  // Google OAuth Config Error State
  const [googleError, setGoogleError] = useState('');

  // Initialize Real Google Identity Services (GIS) OAuth
  useEffect(() => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '843717198002-v83vgrmdhhitosbg56jrthhhk723cpbo.apps.googleusercontent.com';
    if (!clientId) {
      setGoogleError('Google OAuth is not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment with a valid Google OAuth Client ID.');
      return;
    }

    const initGIS = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              if (response?.credential) {
                setIsLoading(true);
                setErrorMsg('');
                const res = await googleLogin(response.credential);
                setIsLoading(false);
                if (res.success) {
                  window.location.href = '/app/dashboard';
                } else {
                  setErrorMsg(res.error || 'Google login failed');
                }
              }
            },
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'continue_with',
            });
            setGoogleError('');
          }
          return true;
        } catch (e: any) {
          setGoogleError('Google GIS initialization failed: ' + (e?.message || 'Invalid client ID'));
        }
      }
      return false;
    };

    if (!initGIS()) {
      const interval = setInterval(() => {
        if (initGIS()) {
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      if (res.requires2FA) {
        setShow2FA(true);
      } else {
        navigate('/app/dashboard');
      }
    } else {
      setErrorMsg(res.error || 'Invalid credentials');
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit TOTP code.');
      return;
    }

    const passed = await verify2FA(otpCode);
    if (passed) {
      navigate('/app/dashboard');
    } else {
      setOtpError('Invalid 6-digit OTP code. Try again.');
    }
  };

  const handleGoogleClick = async () => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '843717198002-v83vgrmdhhitosbg56jrthhhk723cpbo.apps.googleusercontent.com';
    if (!clientId) {
      setGoogleError('Google OAuth is not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment with a valid Google OAuth Client ID.');
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          if (response?.credential) {
            setIsLoading(true);
            setErrorMsg('');
            const res = await googleLogin(response.credential);
            setIsLoading(false);
            if (res.success) {
              window.location.href = '/app/dashboard';
            } else {
              setErrorMsg(res.error || 'Google login failed');
            }
          }
        },
      });
      window.google.accounts.id.prompt();
    } else {
      setGoogleError('Google Identity Services is loading. Please wait 2 seconds and try again.');
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="font-sans bg-white p-8 rounded-xl border border-slate-200 shadow-lg text-slate-900">
      {/* Mobile logo */}
      <motion.div variants={staggerItem} className="lg:hidden flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
          <Zap size={22} />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">TrustRide</span>
      </motion.div>

      <motion.div variants={staggerItem}>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Sign In to TrustRide</h2>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Zero-Trust EV Remote Command Security Console
        </p>
      </motion.div>

      {errorMsg && (
        <div className="mt-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* QUICK DEMO USER PREFILL BUTTONS */}
      <motion.div variants={staggerItem} className="mt-4 p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Quick Demo User Login:</div>
        <div className="flex flex-wrap gap-1.5">
          {demoAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => { setEmail(acc.email); setPassword(acc.pass); }}
              className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-white border border-slate-300 text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer shadow-xs"
            >
              {acc.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.form variants={staggerItem} onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs font-mono font-bold bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
              placeholder="Enter email address"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">Password</label>
            <button
              type="button"
              onClick={() => alert('OTP sent to registered email for password reset.')}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 pl-10 pr-10 text-xs font-mono font-bold bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
              placeholder="Enter password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center space-x-2 text-xs text-slate-700 font-medium">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
          />
          <label htmlFor="remember" className="cursor-pointer font-bold">Remember this device</label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full h-10 text-xs font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-all cursor-pointer shadow-md"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In to Command Console <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-[10px] font-mono font-bold uppercase">
            <span className="px-2 bg-white text-slate-500">
              OR CONTINUE WITH
            </span>
          </div>
        </div>

        {/* Official Google Identity Services GIS Container (Single Button) */}
        <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px] my-2"></div>

        {/* Google OAuth Config Error Alert */}
        {googleError && (
          <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <span>⚠️</span> Google OAuth Configuration Notice
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900">
              {googleError}
            </p>
          </div>
        )}
      </motion.form>

      {/* 2FA VERIFICATION MODAL */}
      {show2FA && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg p-6 max-w-md w-full space-y-4 shadow-2xl font-mono text-slate-900">
            <div className="flex items-center space-x-3 border-b pb-3 border-slate-200">
              <QrCode size={24} className="text-blue-600 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Google Authenticator (2FA)</h3>
                <p className="text-[11px] text-slate-600">Enter 6-digit TOTP code from your mobile app</p>
              </div>
            </div>

            {otpError && <div className="p-2 bg-rose-100 text-rose-700 text-xs font-bold rounded">{otpError}</div>}

            <form onSubmit={handle2FASubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">6-Digit Security OTP (Default: 942815)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="942815"
                  className="w-full text-center tracking-[0.5em] text-lg font-bold p-2.5 rounded-md border border-slate-300 bg-slate-50 text-slate-900"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShow2FA(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold cursor-pointer"
                >
                  Verify & Proceed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <motion.p variants={staggerItem} className="mt-6 text-center text-xs text-slate-600 font-medium">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 font-bold hover:underline">
          Create Account
        </Link>
      </motion.p>
    </motion.div>
  );
}

export default LoginPage;
