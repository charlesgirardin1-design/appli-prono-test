import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup(email, password, displayName);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-deco" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Trophy size={32} /></div>
          <h1>PronoFoot</h1>
          <p>Coupe du Monde 2026</p>
        </div>

        <h2 className="auth-title">Créer un compte</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert-error">{error}</div>}

          <div className="input-group">
            <User size={16} className="input-icon" />
            <input
              type="text"
              placeholder="Pseudo"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="input input-with-icon"
              required
              maxLength={20}
              autoComplete="nickname"
            />
          </div>

          <div className="input-group">
            <Mail size={16} className="input-icon" />
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input input-with-icon"
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <Lock size={16} className="input-icon" />
            <input
              type="password"
              placeholder="Mot de passe (min. 6 caractères)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input input-with-icon"
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-auth">
            {loading ? <span className="btn-spinner" /> : <><span>Créer mon compte</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="auth-switch">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
