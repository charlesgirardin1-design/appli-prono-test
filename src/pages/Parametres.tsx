import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../lib/settings';
import { applyTheme } from '../lib/settings';
import { fetchAndUpdateScores } from '../lib/liveScores';
import { Settings, User, Moon, Sun, Trash2, CheckCircle, Copy, Wifi } from 'lucide-react';

export default function ParametresPage() {
  const [pseudo, setPseudo] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [playerId, setPlayerId] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [apiTesting, setApiTesting] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const s = getSettings();
    setPseudo(s.pseudo);
    setTheme(s.theme);
    setPlayerId(s.playerId);
    setApiKey(localStorage.getItem('pf_football_api_key') || '');
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveSettings({ pseudo: pseudo.trim() || 'Joueur' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    saveSettings({ theme: next });
    applyTheme(next);
  }

  function copyId() {
    navigator.clipboard.writeText(playerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function resetPronos() {
    if (!window.confirm('Supprimer tous vos pronos ? Cette action est irréversible.')) return;
    const all = JSON.parse(localStorage.getItem('pf_pronos') || '[]');
    const pid = playerId;
    const filtered = all.filter((p: { userId: string }) => p.userId !== pid);
    localStorage.setItem('pf_pronos', JSON.stringify(filtered));
    localStorage.removeItem('pf_favoris');
    window.location.reload();
  }

  function saveApiKey() {
    localStorage.setItem('pf_football_api_key', apiKey.trim());
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  }

  async function testApiKey() {
    if (!apiKey.trim()) return;
    setApiTesting(true);
    setApiTestResult(null);
    try {
      await fetchAndUpdateScores(apiKey.trim());
      setApiTestResult('success');
    } catch {
      setApiTestResult('error');
    } finally {
      setApiTesting(false);
      setTimeout(() => setApiTestResult(null), 4000);
    }
  }

  function resetAll() {
    if (!window.confirm('Réinitialiser toutes les données de l\'application ? Vos pronos, groupes et paramètres seront supprimés.')) return;
    ['pf_pronos', 'pf_matches', 'pf_groups', 'pf_favoris', 'pf_seeded', 'pf_settings', 'pf_streak'].forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><Settings size={24} /> Paramètres</h1>
      </div>

      {/* Profil */}
      <div className="card settings-section">
        <h2 className="settings-title"><User size={18} /> Profil</h2>
        <form onSubmit={handleSave} className="settings-form">
          <label className="settings-label">Pseudo affiché</label>
          <div className="form-row">
            <input
              type="text"
              className="input"
              value={pseudo}
              onChange={e => setPseudo(e.target.value)}
              maxLength={20}
              placeholder="Joueur"
            />
            <button type="submit" className="btn-primary">
              {saved ? <><CheckCircle size={14} /> Sauvegardé</> : 'Enregistrer'}
            </button>
          </div>
        </form>
        <div className="settings-id">
          <span className="settings-label">Votre identifiant</span>
          <div className="id-row">
            <code className="player-id">{playerId}</code>
            <button className="btn-icon" onClick={copyId} title="Copier">
              {copied ? <CheckCircle size={15} color="var(--green)" /> : <Copy size={15} />}
            </button>
          </div>
          <p className="settings-hint">Partagez cet identifiant pour apparaître dans les classements de groupes sur d'autres appareils.</p>
        </div>
      </div>

      {/* Apparence */}
      <div className="card settings-section">
        <h2 className="settings-title">{theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />} Apparence</h2>
        <div className="theme-toggle-row">
          <span>{theme === 'dark' ? 'Mode sombre' : 'Mode clair'}</span>
          <button className={`theme-toggle ${theme}`} onClick={toggleTheme}>
            <span className="toggle-thumb" />
          </button>
        </div>
      </div>

      {/* Scores en direct */}
      <div className="card settings-section">
        <h2 className="settings-title"><Wifi size={18} /> Scores en direct</h2>
        <p className="settings-hint">Entrez votre clé API <a href="https://www.football-data.org" target="_blank" rel="noopener noreferrer">football-data.org</a> pour activer la mise à jour automatique des scores (toutes les 60 secondes).</p>
        <label className="settings-label">Clé API scores en direct</label>
        <div className="form-row">
          <input
            type="password"
            className="input"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Votre clé football-data.org"
          />
          <button type="button" className="btn-primary" onClick={saveApiKey}>
            {apiKeySaved ? <><CheckCircle size={14} /> Sauvegardé</> : 'Enregistrer'}
          </button>
          <button type="button" className="btn-secondary" onClick={testApiKey} disabled={apiTesting || !apiKey.trim()}>
            {apiTesting ? 'Test...' : 'Tester'}
          </button>
        </div>
        {apiTestResult === 'success' && (
          <p style={{ color: 'var(--green)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            <CheckCircle size={14} style={{ verticalAlign: 'middle' }} /> Connexion réussie ! Les scores ont été mis à jour.
          </p>
        )}
        {apiTestResult === 'error' && (
          <p style={{ color: 'var(--red, #ef4444)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Erreur de connexion. Vérifiez votre clé API.
          </p>
        )}
      </div>

      {/* Données */}
      <div className="card settings-section danger-zone">
        <h2 className="settings-title"><Trash2 size={18} /> Données</h2>
        <div className="danger-actions">
          <div className="danger-item">
            <div>
              <strong>Réinitialiser mes pronos</strong>
              <p>Supprime tous vos pronos et vos favoris.</p>
            </div>
            <button className="btn-danger" onClick={resetPronos}>Supprimer</button>
          </div>
          <div className="danger-item">
            <div>
              <strong>Réinitialiser l'application</strong>
              <p>Supprime toutes les données (matchs, groupes, paramètres).</p>
            </div>
            <button className="btn-danger" onClick={resetAll}>Tout effacer</button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card settings-section app-info">
        <p>PronoFoot — Coupe du Monde 2026</p>
        <p className="version">v1.0.0</p>
      </div>
    </div>
  );
}
