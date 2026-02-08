// src/components/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission 
}) => {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return null; // AuthProvider will handle showing Login
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-red-200 p-10 max-w-lg text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Access Denied
          </h3>
          
          <p className="text-gray-700 mb-6">
            You don't have permission to access this feature. Please contact your administrator for access.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Required Permission:</span> {requiredPermission}
            </p>
          </div>
          
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;