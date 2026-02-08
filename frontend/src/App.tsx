// src/App.tsx
import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import FileUpload from './components/FileUpload';

const AppContent: React.FC = () => {
  const { user, logout, isAuthenticated, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'upload'>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <Login />;
  }

  const navigation = [
    {
      id: 'dashboard' as const,
      name: 'Dashboard',
      permission: 'view_dashboard' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'analytics' as const,
      name: 'Analytics',
      permission: 'view_analytics' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'upload' as const,
      name: 'Upload Data',
      permission: 'upload_data' as const,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    }
  ];

  // Filter navigation based on permissions
  const availableNavigation = navigation.filter(item => 
    hasPermission(item.permission)
  );

  // Get user initials
  const getUserInitials = () => {
    return user?.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  // Get role badge color
  const getRoleBadge = () => {
    const badges = {
      admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: ' Admin' },
      editor: { bg: 'bg-green-100', text: 'text-green-700', label: ' Editor' },
      viewer: { bg: 'bg-gray-100', text: 'text-gray-700', label: ' Viewer' }
    };
    return badges[user?.role || 'viewer'];
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-blue-600 rounded-xl opacity-0 group-hover:opacity-20 group-hover:animate-ping"></div>
                </div>
                
                <div className="hidden md:block">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    FraudGuard AI
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Detection System</p>
                </div>
              </div>

              <div className="hidden lg:block w-px h-8 bg-gray-200"></div>

              {/* Navigation Tabs */}
              <div className="hidden lg:flex items-center gap-2">
                {availableNavigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      relative px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2
                      ${activeTab === item.id
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {activeTab === item.id && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              
              {/* Role Badge */}
              <div className={`hidden md:flex items-center gap-2 px-3 py-2 ${roleBadge.bg} rounded-xl`}>
                <span className={`text-xs font-bold ${roleBadge.text}`}>{roleBadge.label}</span>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{getUserInitials()}</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{user?.email}</p>
                      <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 ${roleBadge.bg} rounded-full`}>
                        <span className={`text-xs font-bold ${roleBadge.text}`}>{roleBadge.label}</span>
                      </div>
                    </div>
                   
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden border-t border-gray-200 bg-white/50 backdrop-blur-xl">
            <div className="flex items-center justify-around py-2">
              {availableNavigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200
                    ${activeTab === item.id ? 'text-blue-700 bg-blue-50' : 'text-gray-600'}
                  `}
                >
                  {item.icon}
                  <span className="text-xs font-semibold">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="h-16 lg:h-16"></div>

      {/* Main Content with Protected Routes */}
      <main className="min-h-[calc(100vh-4rem)]">
        {activeTab === 'dashboard' && (
          <ProtectedRoute requiredPermission="view_dashboard">
            <Dashboard />
          </ProtectedRoute>
        )}
        {activeTab === 'analytics' && (
          <ProtectedRoute requiredPermission="view_analytics">
            <Analytics />
          </ProtectedRoute>
        )}
        {activeTab === 'upload' && (
          <ProtectedRoute requiredPermission="upload_data">
            <FileUpload />
          </ProtectedRoute>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-200 mt-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Logged in as: <span className="font-semibold text-gray-900">{user?.name}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>FraudGuard AI <span className="font-semibold text-gray-700"></span></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;