// src/components/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import robotImage from '../assets/robot-holding.png';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: 'admin' | 'editor' | 'viewer') => {
    const credentials = {
      admin: { email: 'admin@fraudguard.com', password: 'admin123' },
      editor: { email: 'editor@fraudguard.com', password: 'editor123' },
      viewer: { email: 'viewer@fraudguard.com', password: 'viewer123' }
    };
    
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-6xl">
        
        {/* Robot Holding Form - Positioned at Top */}
        <div className="relative">
          
          {/* Robot Image - Appearing from Top */}
          <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
            <img 
              src={robotImage} 
              alt="AI Robot" 
              className="w-64 h-auto drop-shadow-2xl animate-bounce-slow"
              style={{ 
                filter: 'drop-shadow(0 20px 40px rgba(59, 130, 246, 0.5))',
                animation: 'float 3s ease-in-out infinite'
              }}
            />
          </div>

          {/* Login Card with Robot Holding Effect */}
          <div className="relative mt-40 mx-auto max-w-md">
            
            {/* Logo Header */}
         

            {/* Login Form Card */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 relative z-10">
              
              {/* Header */}
              <div className="text-center mb-8">
                <p className="text-gray-300"></p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                  <svg className="w-5 h-5 text-red-300 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-red-200 font-medium">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl focus:border-blue-400 focus:bg-white/15 focus:outline-none transition-all text-white placeholder-gray-400"
                      placeholder="admin@fraudguard.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl focus:border-blue-400 focus:bg-white/15 focus:outline-none transition-all text-white placeholder-gray-400"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white font-bold text-lg rounded-xl shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In to Dashboard
                    </>
                  )}
                </button>
              </form>

              {/* Demo Accounts */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-gray-400 text-center mb-4 font-semibold uppercase tracking-wider">Demo Access</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => quickLogin('admin')}
                    className="group px-3 py-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border-2 border-blue-400/30 hover:border-blue-400/50 rounded-xl text-xs font-bold text-blue-300 transition-all backdrop-blur-sm hover:scale-105"
                  >
                    <div className="text-lg mb-1"></div>
                    <div>Admin</div>
                  </button>
                  <button
                    onClick={() => quickLogin('editor')}
                    className="group px-3 py-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border-2 border-green-400/30 hover:border-green-400/50 rounded-xl text-xs font-bold text-green-300 transition-all backdrop-blur-sm hover:scale-105"
                  >
                    <div className="text-lg mb-1"></div>
                    <div>Editor</div>
                  </button>
                  <button
                    onClick={() => quickLogin('viewer')}
                    className="group px-3 py-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-2 border-purple-400/30 hover:border-purple-400/50 rounded-xl text-xs font-bold text-purple-300 transition-all backdrop-blur-sm hover:scale-105"
                  >
                    <div className="text-lg mb-1"></div>
                    <div>Viewer</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            
          </div>
        </div>
      </div>

      {/* CSS for Float Animation */}
      <style >{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;