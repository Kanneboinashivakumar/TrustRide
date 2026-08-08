import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Building, Phone, Shield, ArrowRight } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/motion/variants';
import { useAuth } from '@/providers/auth-provider';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('Security Officer');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const roles = [
    'Fleet Manager',
    'Security Officer',
    'Operations Manager',
    'Viewer',
    'Driver',
    'Administrator',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!firstName || !lastName || !email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (!acceptTerms) {
      setErrorMsg('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    const res = await register({
      firstName,
      lastName,
      organization,
      role,
      email,
      phone,
      password,
    });
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } else {
      setErrorMsg(res.error || 'Failed to create account.');
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="font-sans bg-white p-8 rounded-xl border border-slate-200 shadow-lg text-slate-900">
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Create TrustRide Account</h2>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Join the Zero-Trust Commercial EV Command Security Network
        </p>
      </motion.div>

      {errorMsg && (
        <div className="mt-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono">
          ✓ {successMsg}
        </div>
      )}

      <motion.form variants={staggerItem} onSubmit={handleSubmit} className="mt-6 space-y-3.5 text-xs font-mono">
        {/* Name Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-800 block mb-1">First Name *</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Sarah"
              className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-900 font-bold placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="font-bold text-slate-800 block mb-1">Last Name *</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Kim"
              className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-900 font-bold placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Organization & Role */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Organization</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Commercial EV Co-op"
              className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-900 font-bold placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="font-bold text-slate-800 block mb-1">Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-900 font-bold"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah.kim@trustride.io"
              className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-900 font-bold placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="font-bold text-slate-800 block mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 11111"
              className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-900 font-bold placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Password & Confirm */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-900 font-bold placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="font-bold text-slate-800 block mb-1">Confirm Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full h-9 px-3 rounded-md border border-slate-300 bg-white text-slate-900 font-bold placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-center space-x-2 pt-1 text-slate-700 font-medium">
          <input
            type="checkbox"
            id="terms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
          />
          <label htmlFor="terms" className="cursor-pointer font-bold">I agree to the Terms of Service & Privacy Policy</label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-md"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </motion.form>

      <motion.p variants={staggerItem} className="mt-5 text-center text-xs text-slate-600 font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 font-bold hover:underline">
          Back to Login
        </Link>
      </motion.p>
    </motion.div>
  );
}

export default RegisterPage;
