import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, saveSettings, applyTheme } from '../lib/settings';
import { getCurrentUser, updateDisplayName, deleteAccount } from '../lib/auth';
import { Settings, User, Moon, Sun, Trash2, CheckCircle, Copy } from 'lucide-react';

export default function ParametresPage() {
  const [pseudo, setPseudo] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [playerId, setPlayerId] = useState('');
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setTheme(s.theme);

    // Charger pseudo et playerId depuis le compte connecte
    const user = getCurrentUser();
    if (user) {
      setPseudo(user.displayName);
      setPlayerId(user.playerId ?? s.playerId);
    } else {
      setPseudo(s.pseudo);
      setPlayerId(s.playerId);
    }
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = pseudo.trim() || 'Joueur';
    // Mettre a jour le compte auth
    const user = getCurrentUser();
    if (user) {
      updateDisplayName(user.uid, trimmed);
    }
    // Mettre a jour pf_settings aussi (compatibilite)
    saveSettings({ pseudo: trimmed });
    setPseudo(trimmed);
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
    if (!window.confirm('Supprimer tous vos pronos ? Cette action est irreversible.')) return;
    const all = JSON.parse(localStorage.getItem('pf_pronos') || '[]');
    const filtered = all.filter((p: { userId: string }) => p.userId !== playerId);
    localStorage.setItem('pf_pronos', JSON.stringify(filtered));
    localStorage.removeItem('pf_favoris');
    window.location.reload();
  }

  function resetAll() {
    if (!window.confirm("Reinitialiser toutes les donnees de l'application ?")) return;
    ['pf_pronos', 'pf_matches', 'pf_groups', 'pf_favoris', 'pf_seeded', 'pf_settings', 'pf_streak'].forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }


  function handleDeleteAccount() {
    if (!window.confirm('Supprimer definitivement votre compte et toutes vos donnees ? Cette action est irreversible.')) return;
    const user = getCurrentUser();
    if (!user) return;
    deleteAccount(user.uid);
    navigate('/login');
    window.location.reload();
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><Settings size={24} /> Parametres</h1>
      </div>

      <div className="card settings-section">
        <h2 className="settings-title"><User size={18} /> Profil</h2>
        <form onSubmit={handleSave} className="settings-form">
          <label className="settings-label">Pseudo affiche</label>
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
              {saved ? <><CheckCircle size={14} /> Sauvegarde</> : 'Enregistrer'}
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
          <p className="settings-hint">Cet identifiant est unique a votre compte. Partagez-le pour apparaitre dans les classements de groupes.</p>
        </div>
      </div>

      <div className="card settings-section">
        <h2 className="settings-title">{theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />} Apparence</h2>
        <div className="theme-toggle-row">
          <span>{theme === 'dark' ? 'Mode sombre' : 'Mode clair'}</span>
          <button className={`theme-toggle ${theme}`} onClick={toggleTheme}>
            <span className="toggle-thumb" />
          </button>
        </div>
      </div>

      <div className="card settings-section danger-zone">
        <h2 className="settings-title"><Trash2 size={18} /> Donnees</h2>
        <div className="danger-actions">
          <div className="danger-item">
            <div>
              <strong>Reinitialiser mes pronos</strong>
              <p>Supprime tous vos pronos et vos favoris.</p>
            </div>
            <button className="btn-danger" onClick={resetPronos}>Supprimer</button>
          </div>
          <div className="danger-item">
            <div>
              <strong>Reinitialiser l'application</strong>
              <p>Supprime toutes les donnees (matchs, groupes, parametres).</p>
            </div>
            <button className="btn-danger" onClick={resetAll}>Tout effacer</button>
          </div>
          <div className="danger-item" style={{borderTop: '1px solid #374151', paddingTop: '1rem', marginTop: '0.5rem'}}>
            <div>
              <strong style={{color: '#ef4444'}}>Supprimer mon compte</strong>
              <p>Supprime definitivement votre compte et toutes vos donnees. Irreversible.</p>
            </div>
            <button className="btn-danger" onClick={handleDeleteAccount} style={{background: '#7f1d1d'}}>Supprimer le compte</button>
          </div>
        </div>
      </div>

      <div className="card settings-section app-info">
        <p>PronoFoot - Coupe du Monde 2026</p>
        <p className="version">v1.0.0</p>
      </div>
    </div>
  );
}
