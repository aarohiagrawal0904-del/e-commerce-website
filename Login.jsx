import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirection handling (redirect to target or base profile)
  const from = location.state?.from?.pathname || '/';

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all input fields.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      // Redirect based on role
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser && savedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glow Orbs */}
      <div className="glow-orb glow-blue top-1/4 left-1/3" />
      
      <div className="max-w-md w-full relative z-10">
        
        {/* Form Container Card */}
        <div className="glass-panel border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome Back
            </h2>
            <p className="text-sm text-dark-300">
              Sign in to your account to view products & track orders
            </p>
          </div>

          {/* Validation Error Banner */}
          {error && (
            <div className="flex items-center space-x-2.5 p-4 bg-red-950/40 border border-red-800/30 text-red-400 rounded-2xl text-sm text-left animate-slide-up">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            
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
                  placeholder="name@example.com"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center pl-1">
                <label className="text-xs font-bold text-dark-200 uppercase tracking-widest">
                  Password
                </label>
              </div>
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
                  <LogIn className="w-4.5 h-4.5" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>

          </form>

          {/* Sign Up Link */}
          <div className="pt-4 text-xs text-dark-300">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="text-primary-400 font-bold hover:text-primary-300 hover:underline transition"
            >
              Create Account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
