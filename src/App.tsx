import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Classement from './pages/Classement';
import Groupes from './pages/Groupes';
import Favoris from './pages/Favoris';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/classement" element={<Classement />} />
          <Route path="/groupes" element={<Groupes />} />
          <Route path="/favoris" element={<Favoris />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
