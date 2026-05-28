import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all standard inputs.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email format.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return false;
    }
    return true;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setSubmitting(true);
    const result = await signup(name, email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glow Orbs */}
      <div className="glow-orb glow-purple top-1/4 right-1/3" />
      
      <div className="max-w-md w-full relative z-10">
        
        {/* Form Container Card */}
        <div className="glass-panel border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Create Account
            </h2>
            <p className="text-sm text-dark-300">
              Register now to start shopping with custom AI tracking
            </p>
          </div>

          {/* Validation Error Banner */}
          {error && (
            <div className="flex items-center space-x-2.5 p-4 bg-red-950/40 border border-red-800/30 text-red-400 rounded-2xl text-sm text-left animate-slide-up">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Signup Form */}
          <form className="space-y-4" onSubmit={handleSignupSubmit}>
            
            {/* Name Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-dark-200 uppercase tracking-widest pl-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-300">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm"
                  placeholder="John Doe"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-dark-200 uppercase tracking-widest pl-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-300">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm"
                  placeholder="john@example.com"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-dark-200 uppercase tracking-widest pl-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-300">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm"
                  placeholder="••••••••"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-dark-200 uppercase tracking-widest pl-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-300">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm"
                  placeholder="••••••••"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/30 transition-all duration-200 disabled:opacity-50 active:scale-[0.98] mt-6"
              disabled={submitting}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4.5 h-4.5" />
                  <span>Register Profile</span>
                </>
              )}
            </button>

          </form>

          {/* Login Link */}
          <div className="pt-4 text-xs text-dark-300">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-400 font-bold hover:text-primary-300 hover:underline transition"
            >
              Sign In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Signup;
