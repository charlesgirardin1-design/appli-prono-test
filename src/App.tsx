import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Classement from './pages/Classement';
import Groupes from './pages/Groupes';
import Favoris from './pages/Favoris';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
}

function AppContent() {
  const { currentUser } = useAuth();
  return (
    <BrowserRouter>
      {currentUser && <Navbar />}
      <div className={currentUser ? 'app-content' : ''}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/classement" element={<PrivateRoute><Classement /></PrivateRoute>} />
          <Route path="/groupes" element={<PrivateRoute><Groupes /></PrivateRoute>} />
          <Route path="/favoris" element={<PrivateRoute><Favoris /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
