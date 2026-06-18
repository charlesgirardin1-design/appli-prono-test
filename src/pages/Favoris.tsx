import React, { useState, useEffect } from 'react';
import { saveFavoris, getFavoris } from '../lib/firestore';
import { Star, Trophy, Crosshair, CheckCircle } from 'lucide-react';

const TEAMS = [
  'France', 'Brésil', 'Argentine', 'Angleterre', 'Espagne', 'Allemagne',
  'Portugal', 'Pays-Bas', 'Belgique', 'Italie', 'Uruguay', 'Maroc',
  'Sénégal', 'États-Unis', 'Mexique', 'Japon', 'Australie', 'Croatie',
];

const TOP_SCORERS = [
  'Kylian Mbappé', 'Erling Haaland', 'Vinicius Jr.', 'Lionel Messi',
  'Cristiano Ronaldo', 'Harry Kane', 'Pedri', 'Phil Foden',
  'Jude Bellingham', 'Lamine Yamal', 'Rodri', 'Bukayo Saka',
];

export default function Favoris() {
  const [winner, setWinner] = useState('');
  const [topScorer, setTopScorer] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    getFavoris().then(f => {
      if (f) {
        setWinner(f.winner);
        setTopScorer(f.topScorer);
        setLocked(true);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!winner || !topScorer) return;
    setLoading(true);
    try {
      await saveFavoris(winner, topScorer);
      setSaved(true);
      setLocked(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><Star size={24} /> Favoris du tournoi</h1>
      </div>

      <div className="favoris-info card">
        <p>Donnez vos pronostics pour l'ensemble du tournoi. Ces choix vous rapporteront des <strong>points bonus</strong> à la fin.</p>
        <div className="favoris-rules">
          <div className="rule-item">
            <Trophy size={20} className="rule-icon" />
            <div><strong>Vainqueur du tournoi</strong><p>Quelle équipe va soulever le trophée ?</p></div>
          </div>
          <div className="rule-item">
            <Crosshair size={20} className="rule-icon" />
            <div><strong>Meilleur buteur</strong><p>Qui finira avec le plus de buts ?</p></div>
          </div>
        </div>
        {locked && (
          <div className="alert-locked">
            <CheckCircle size={16} /> Vos favoris ont été enregistrés. Ils ne peuvent plus être modifiés.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="favoris-form card">
        <div className="favoris-field">
          <label><Trophy size={16} /> Équipe vainqueur</label>
          <select value={winner} onChange={e => setWinner(e.target.value)}
            className="select full" disabled={locked} required>
            <option value="">Choisir une équipe...</option>
            {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="favoris-field">
          <label><Crosshair size={16} /> Meilleur buteur</label>
          <select value={topScorer} onChange={e => setTopScorer(e.target.value)}
            className="select full" disabled={locked} required>
            <option value="">Choisir un joueur...</option>
            {TOP_SCORERS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {!locked && (
          <button type="submit" disabled={loading || !winner || !topScorer} className="btn-primary full">
            {saved ? <><CheckCircle size={16} /> Enregistré !</> : loading ? 'Sauvegarde...' : 'Valider mes favoris'}
          </button>
        )}
      </form>

      {locked && winner && topScorer && (
        <div className="favoris-recap card">
          <h3>Vos pronostics</h3>
          <div className="recap-row"><Trophy size={18} /><span>Vainqueur : <strong>{winner}</strong></span></div>
          <div className="recap-row"><Crosshair size={18} /><span>Meilleur buteur : <strong>{topScorer}</strong></span></div>
        </div>
      )}
    </div>
  );
}
