import React, { useState, useEffect } from 'react';
import { Match, Prono } from '../types';
import { saveProno, getPronoForMatch, hasJokerAvailable } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Clock, CheckCircle, Zap, Star } from 'lucide-react';

interface Props {
  match: Match;
}

export default function MatchCard({ match }: Props) {
  const { currentUser } = useAuth();
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [joker, setJoker] = useState(false);
  const [jokerAvailable, setJokerAvailable] = useState(true);
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
        setJoker(p.joker);
      }
    });
    hasJokerAvailable(currentUser.uid).then(avail => setJokerAvailable(avail));
  }, [currentUser, match.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || homeScore === '' || awayScore === '') return;
    setLoading(true);
    try {
      await saveProno(currentUser.uid, match.id, parseInt(homeScore), parseInt(awayScore), joker);
      setSaved(true);
      setJokerAvailable(joker ? false : jokerAvailable);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  function getResultBadge() {
    if (!existing || existing.totalPoints === undefined) return null;
    const pts = existing.totalPoints;
    const isExact = existing.bonusExact && existing.bonusExact > 0;
    const color = pts > 0 ? (isExact ? 'badge-gold' : 'badge-silver') : 'badge-red';
    return (
      <div className="result-badges">
        <span className={`badge ${color}`}>
          {existing.joker && <Zap size={11} />}
          {pts} pts
        </span>
        {isExact && <span className="badge badge-exact"><Star size={11} /> Score exact +{existing.bonusExact}</span>}
      </div>
    );
  }

  function getOddLabel(odd: number, label: string) {
    return (
      <div className="odd-item">
        <span className="odd-label">{label}</span>
        <span className="odd-value">{odd.toFixed(2)}</span>
        <span className="odd-pts">{Math.round(odd * 10)} pts</span>
      </div>
    );
  }

  return (
    <div className={`match-card ${match.status} ${existing?.joker ? 'has-joker' : ''}`}>
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

      {/* Affichage des cotes */}
      {match.odds && (
        <div className="odds-row">
          {getOddLabel(match.odds.home, match.homeTeam.name.split(' ')[0])}
          {getOddLabel(match.odds.draw, 'Nul')}
          {getOddLabel(match.odds.away, match.awayTeam.name.split(' ')[0])}
        </div>
      )}

      {!isPast && currentUser && (
        <form onSubmit={handleSubmit} className="prono-form">
          <div className="prono-inputs">
            <input
              type="number" min="0" max="20"
              value={homeScore}
              onChange={e => setHomeScore(e.target.value)}
              placeholder="0"
              className="score-input"
            />
            <span className="dash">-</span>
            <input
              type="number" min="0" max="20"
              value={awayScore}
              onChange={e => setAwayScore(e.target.value)}
              placeholder="0"
              className="score-input"
            />
          </div>

          {/* Bouton joker X2 */}
          <button
            type="button"
            onClick={() => setJoker(!joker)}
            className={`btn-joker ${joker ? 'active' : ''} ${!jokerAvailable && !joker ? 'disabled' : ''}`}
            disabled={!jokerAvailable && !joker}
            title={jokerAvailable || joker ? 'Activer le bonus X2 sur ce match' : 'Joker déjà utilisé'}
          >
            <Zap size={14} />
            X2
          </button>

          <button type="submit" disabled={loading} className="btn-prono">
            {saved ? <><CheckCircle size={14} /> Sauvegardé</> : loading ? '...' : existing ? 'Modifier' : 'Pronostiquer'}
          </button>
        </form>
      )}

      {isPast && existing && (
        <div className="prono-result">
          <span className="prono-label">
            {existing.joker && <Zap size={12} className="joker-icon" />}
            Mon prono : {existing.homeScore} - {existing.awayScore}
          </span>
          {getResultBadge()}
        </div>
      )}

      {isPast && !existing && (
        <div className="prono-result no-prono">
          <span className="prono-label">Aucun prono soumis</span>
        </div>
      )}
    </div>
  );
}
