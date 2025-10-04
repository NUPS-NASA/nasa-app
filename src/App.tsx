import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import ProtectedRoute from './features/auth/ProtectedRoute';
import Login from './features/main/auth/Login';
import Signup from './features/main/auth/Signup';
import UserProfileMain from './features/main/user/profile/UserProfileMain';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/auth/signup/*" element={<Signup />} />
            <Route path="/auth/login/*" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <UserProfileMain />
                </ProtectedRoute>
              }
            />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </div>
  );
};

export default App;
