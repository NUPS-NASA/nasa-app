import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import ProtectedRoute from './features/auth/ProtectedRoute';
import Login from './features/main/auth/Login';
import Signup from './features/main/auth/Signup';
import UserProfileMain from './features/main/user/profile/UserProfileMain';
import Main from './features/main/Main';
import UserProjects from './features/main/user/profile/UserProjects';
import UserUploads from './features/main/user/profile/UserUploads';
import UserLikedProjects from './features/main/user/profile/UserLikedProjects';
import DashboardRedirect from './features/main/DashboardRedirect';
import ResultAnal from './features/repository/result/ResultAnal';
import Community from './features/community/Community';
import ProjectMain from './features/main/project/ProjectMain';

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/auth/signup/*" element={<Signup />} />
            <Route path="/auth/login/*" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Main />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardRedirect />} />
              <Route path="/user/:userId/" element={<Navigate to="/profile" replace />} />
              <Route path="user/:userId/profile" element={<UserProfileMain />} />
              <Route path="user/:userId/uploads" element={<UserUploads />} />
              <Route path="user/:userId/projects" element={<UserProjects />} />
              <Route path="user/:userId/likedprojects" element={<UserLikedProjects />} />
              <Route path="repo/:repoId/result" element={<ResultAnal />} />
              <Route path="proj/:projId/" element={<ProjectMain />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </div>
  );
};

export default App;
