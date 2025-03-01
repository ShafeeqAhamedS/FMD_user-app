import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Box, LogOut, Loader2, UserCircle } from 'lucide-react';
import { useEffect } from 'react';
import fmd from '../assets/fmd.png';

export default function Layout() {
  const { user, logout, isLoading, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔄 Layout rendered with auth state:', { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    console.log('📍 Location changed:', location.pathname);
  }, [location]);

  // Show loading state if authentication status is being checked
  if (isLoading && location.pathname !== '/login' && location.pathname !== '/register') {
    console.log('⏳ Showing auth loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // For login and register pages, show a simplified header
  if (!isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex items-center">
                  <img src={fmd} className="h-6 w-6 text-blue-600 dark:text-blue-500" alt="FMD Logo" />
                  <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">FMD</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {location.pathname === '/login' ? (
                  <Link 
                    to="/register" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Register
                  </Link>
                ) : (
                  <Link 
                    to="/login" 
                    className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 User not authenticated, redirecting to login');
    navigate('/login');
    return null;
  }

  console.log('✅ Rendering authenticated layout for user:', user?.name);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <img src={fmd} className="h-6 w-6 text-blue-600 dark:text-blue-500" alt="FMD Logo" />
                <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">FMD</span>
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/dashboard'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/deploy"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/deploy'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  Deploy Model
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-8 w-8" />
                    )}
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>
                  <button
                    onClick={logout}
                    className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}