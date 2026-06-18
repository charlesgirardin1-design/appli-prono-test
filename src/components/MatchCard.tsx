import React, { useState, useEffect } from 'react';
import { Match, Prono } from '../types';
import { saveProno, getPronoForMatch } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Clock, CheckCircle } from 'lucide-react';

interface Props {
  match: Match;
}

export default function MatchCard({ match }: Props) {
  const { currentUser } = useAuth();
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState<Prono | null>(null);
  const [loading, setLoading] = useState(false);

  const isPast = match.status !== 'upcoming';
  const matchDate = new Date(match.date);

  useEffect(() => {
    if (!currentUser) return;
    getPronoForMatch(currentUser.uid, match.id).then(p => {
      if (p) {
        setExisting(p);
        setHomeScore(String(p.homeScore));
        setAwayScore(String(p.awayScore));
      }
    });
  }, [currentUser, match.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || homeScore === '' || awayScore === '') return;
    setLoading(true);
    try {
      await saveProno(currentUser.uid, match.id, parseInt(homeScore), parseInt(awayScore));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  function getPointsBadge() {
    if (existing?.points === undefined || existing.points === null) return null;
    const colors: Record<number, string> = { 3: 'badge-gold', 1: 'badge-silver', 0: 'badge-red' };
    const labels: Record<number, string> = { 3: '3 pts', 1: '1 pt', 0: '0 pt' };
    return <span className={`badge ${colors[existing.points]}`}>{labels[existing.points]}</span>;
  }

  return (
    <div className={`match-card ${match.status}`}>
      <div className="match-meta">
        <span className="competition">{match.competition}</span>
        <span className="match-date">
          <Clock size={12} />
          {matchDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
          {' '}
          {matchDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="match-teams">
        <div className="team">
          <span className="team-name">{match.homeTeam.name}</span>
        </div>
        <div className="match-score">
          {isPast ? (
            <span className="final-score">{match.homeScore} - {match.awayScore}</span>
          ) : (
            <span className="vs">VS</span>
          )}
        </div>
        <div className="team away">
          <span className="team-name">{match.awayTeam.name}</span>
        </div>
      </div>

      {!isPast && currentUser && (
        <form onSubmit={handleSubmit} className="prono-form">
          <div className="prono-inputs">
            <input
              type="number"
              min="0"
              max="20"
              value={homeScore}
              onChange={e => setHomeScore(e.target.value)}
              placeholder="0"
              className="score-input"
            />
            <span className="dash">-</span>
            <input
              type="number"
              min="0"
              max="20"
              value={awayScore}
              onChange={e => setAwayScore(e.target.value)}
              placeholder="0"
              className="score-input"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-prono">
            {saved ? <><CheckCircle size={14} /> Sauvegardé</> : loading ? '...' : existing ? 'Modifier' : 'Pronostiquer'}
          </button>
        </form>
      )}

      {isPast && existing && (
        <div className="prono-result">
          <span className="prono-label">Mon prono : {existing.homeScore} - {existing.awayScore}</span>
          {getPointsBadge()}
        </div>
      )}
    </div>
  );
}
