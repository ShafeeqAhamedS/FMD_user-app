import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Deploy from './pages/Deploy.jsx';
import Profile from './pages/Profile.jsx';
import ProjectPreview from './pages/ProjectPreview.jsx';
import Upload from './pages/Upload.jsx';
import NewPage from './pages/NewPage.jsx';
import { useAuthStore } from './store/auth.js';

function PrivateRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  useEffect(() => {
    console.log('🔒 PrivateRoute check:', { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);
  
  if (isLoading) {
    console.log('⏳ PrivateRoute showing loading state');
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    console.log('🔒 PrivateRoute redirecting to login');
    return <Navigate to="/login" />;
  }
  
  console.log('✅ PrivateRoute rendering children for user:', user?.name);
  return <>{children}</>;
}

function App() {
  const { loadUser } = useAuthStore();
  
  useEffect(() => {
    console.log('🚀 App component mounted - loading user');
    loadUser()
      .then(() => console.log('✅ User loaded successfully'))
      .catch(err => console.error('❌ Failed to load user:', err));
  }, [loadUser]);
  
  console.log('🔄 App rendering');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="deploy"
            element={
              <PrivateRoute>
                <Deploy />
              </PrivateRoute>
            }
          />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="projects/:id"
            element={
              <PrivateRoute>
                <ProjectPreview />
              </PrivateRoute>
            }
          />
          <Route
            path="upload"
            element={
              <PrivateRoute>
                <Upload />
              </PrivateRoute>
            }
          />
          <Route
            path="deploying_page"
            element={
              <PrivateRoute>
                <NewPage />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;