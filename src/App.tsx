import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { seedMatchesIfNeeded } from './lib/seed';
import { applyTheme, getSettings } from './lib/settings';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Classement from './pages/Classement';
import Groupes from './pages/Groupes';
import Favoris from './pages/Favoris';
import ParametresPage from './pages/Parametres';
import './App.css';

export default function App() {
  useEffect(() => {
    seedMatchesIfNeeded();
    applyTheme(getSettings().theme);
  }, []);
  return (
    <BrowserRouter>
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/classement" element={<Classement />} />
          <Route path="/groupes" element={<Groupes />} />
          <Route path="/favoris" element={<Favoris />} />
          <Route path="/parametres" element={<ParametresPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
