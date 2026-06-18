import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { seedMatchesIfNeeded } from './lib/seed';
import { applyTheme, getSettings } from './lib/settings';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Classement from './pages/Classement';
import Groupes from './pages/Groupes';
import Favoris from './pages/Favoris';
import ParametresPage from './pages/Parametres';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { currentUser } = useAuth();

  useEffect(() => {
    seedMatchesIfNeeded();
    applyTheme(getSettings().theme);
  }, []);

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/classement" element={<PrivateRoute><Classement /></PrivateRoute>} />
          <Route path="/groupes" element={<PrivateRoute><Groupes /></PrivateRoute>} />
          <Route path="/favoris" element={<PrivateRoute><Favoris /></PrivateRoute>} />
          <Route path="/parametres" element={<PrivateRoute><ParametresPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
