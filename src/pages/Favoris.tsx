import React, { useState, useEffect } from 'react';
import { saveFavoris, getFavoris } from '../lib/firestore';
import { Star, Trophy, Crosshair, CheckCircle } from 'lucide-react';
import { FlagImg } from '../lib/flags';

// All 48 WC2026 countries (from seed data)
const ALL_TEAMS = [
  'Mexique', 'Équateur', 'Canada', 'Suisse', 'Brésil', 'Maroc',
  'États-Unis', 'Paraguay', 'Australie', 'Türkiye', 'Allemagne', 'Curaçao',
  "Côte d'Ivoire", 'Pays-Bas', 'Japon', 'Suède', 'Tunisie', 'Belgique',
  'Égypte', 'Iran', 'Nouvelle-Zélande', 'Espagne', 'Cabo Verde',
  'Arabie Saoudite', 'Uruguay', 'France', 'Sénégal', 'Norvège', 'Irak',
  'Argentine', 'Algérie', 'Autriche', 'Jordanie', 'Portugal', 'Congo DR',
  'Ouzbékistan', 'Colombie', 'Angleterre', 'Croatie', 'Ghana', 'Panama',
  'Afrique du Sud', 'Corée du Sud', 'Tchéquie', 'Qatar', 'Haïti', 'Écosse',
  'Bosnie-Herzégovine',
].sort();

const TOP_SCORERS: { name: string; team: string }[] = [
  { name: 'Kylian Mbappé', team: 'France' },
  { name: 'Vinicius Jr.', team: 'Brésil' },
  { name: 'Lionel Messi', team: 'Argentine' },
  { name: 'Erling Haaland', team: 'Norvège' },
  { name: 'Harry Kane', team: 'Angleterre' },
  { name: 'Cristiano Ronaldo', team: 'Portugal' },
  { name: 'Lamine Yamal', team: 'Espagne' },
  { name: 'Jude Bellingham', team: 'Angleterre' },
  { name: 'Rodri', team: 'Espagne' },
  { name: 'Phil Foden', team: 'Angleterre' },
  { name: 'Bukayo Saka', team: 'Angleterre' },
  { name: 'Pedri', team: 'Espagne' },
  { name: 'Federico Valverde', team: 'Uruguay' },
  { name: 'Vinícius Jr.', team: 'Brésil' },
  { name: 'Raphinha', team: 'Brésil' },
  { name: 'Neymar Jr.', team: 'Brésil' },
  { name: 'Nicolás González', team: 'Argentine' },
  { name: 'Julián Álvarez', team: 'Argentine' },
  { name: 'Karim Benzema', team: 'France' },
  { name: 'Antoine Griezmann', team: 'France' },
  { name: 'Ousmane Dembélé', team: 'France' },
  { name: 'Sadio Mané', team: 'Sénégal' },
  { name: 'Mohamed Salah', team: 'Égypte' },
  { name: 'Richarlison', team: 'Brésil' },
  { name: 'Hirving Lozano', team: 'Mexique' },
  { name: 'Giovanni Reyna', team: 'États-Unis' },
  { name: 'Christian Pulisic', team: 'États-Unis' },
  { name: 'Alphonso Davies', team: 'Canada' },
  { name: 'Son Heung-min', team: 'Corée du Sud' },
  { name: 'Hakim Ziyech', team: 'Maroc' },
  { name: 'Sofiane Boufal', team: 'Maroc' },
  { name: 'Darwin Núñez', team: 'Uruguay' },
  { name: 'Khvicha Kvaratskhelia', team: 'Géorgie' },
  { name: 'Leroy Sané', team: 'Allemagne' },
  { name: 'Florian Wirtz', team: 'Allemagne' },
  { name: 'Kai Havertz', team: 'Allemagne' },
  { name: 'Xavi Simons', team: 'Pays-Bas' },
  { name: 'Donyell Malen', team: 'Pays-Bas' },
  { name: 'Memphis Depay', team: 'Pays-Bas' },
  { name: 'Diogo Jota', team: 'Portugal' },
  { name: 'Rafael Leão', team: 'Portugal' },
  { name: 'Bruno Fernandes', team: 'Portugal' },
  { name: 'Dušan Vlahović', team: 'Serbie' },
  { name: 'Hakan Çalhanoğlu', team: 'Türkiye' },
  { name: 'Arda Güler', team: 'Türkiye' },
  { name: 'Nicolás Jackson', team: 'Sénégal' },
  { name: 'Takumi Minamino', team: 'Japon' },
  { name: 'Kaoru Mitoma', team: 'Japon' },
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
          {winner && <div className="flag-preview"><FlagImg name={winner} size={32} /> <span>{winner}</span></div>}
          <select value={winner} onChange={e => setWinner(e.target.value)}
            className="select full" disabled={locked} required>
            <option value="">Choisir une équipe...</option>
            {ALL_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="favoris-field">
          <label><Crosshair size={16} /> Meilleur buteur</label>
          <select value={topScorer} onChange={e => setTopScorer(e.target.value)}
            className="select full" disabled={locked} required>
            <option value="">Choisir un joueur...</option>
            {TOP_SCORERS.map(p => (
              <option key={p.name} value={p.name}>{p.name} ({p.team})</option>
            ))}
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
          <div className="recap-row"><Trophy size={18} /><FlagImg name={winner} size={22} /><span>Vainqueur : <strong>{winner}</strong></span></div>
          <div className="recap-row"><Crosshair size={18} /><span>Meilleur buteur : <strong>{topScorer}</strong></span></div>
        </div>
      )}
    </div>
  );
}
