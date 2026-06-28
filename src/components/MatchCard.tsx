import React, { useState, useEffect, useRef } from 'react';
import { Match, Prono } from '../types';
import { saveProno, getPronoForMatch, hasJokerAvailable } from '../lib/firestore';
import { recordPronoToday } from '../hooks/useStreak';
import { fireConfetti } from '../hooks/useConfetti';
import Countdown from './Countdown';
import { CheckCircle, Zap, Star } from 'lucide-react';
import { FlagImg } from '../lib/flags';
import { getEffectiveStatus } from '../lib/matchStatus';

interface Props {
  match: Match;
}

export default function MatchCard({ match }: Props) {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [joker, setJoker] = useState(false);
  const [jokerAvailable, setJokerAvailable] = useState(true);
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState<Prono | null>(null);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const effectiveStatus = getEffectiveStatus(match);
  const isLive = effectiveStatus === 'live';
  const isPast = effectiveStatus !== 'upcoming';

  useEffect(() => {
    getPronoForMatch(match.id).then(p => {
      if (p) {
        setExisting(p);
        setHomeScore(String(p.homeScore));
        setAwayScore(String(p.awayScore));
        setJoker(p.joker);
      }
    });
    hasJokerAvailable().then(setJokerAvailable);
  }, [match.id]);

  // Auto-flip après 1s pour les matchs terminés avec prono et points calculés
  useEffect(() => {
    if (isPast && existing?.totalPoints !== undefined && !revealed) {
      const timer = setTimeout(() => {
        setFlipped(true);
        setTimeout(() => {
          setRevealed(true);
          if (existing.bonusExact && existing.bonusExact > 0) {
            fireConfetti();
          }
        }, 300);
      }, 600 + Math.random() * 400); // léger décalage aléatoire entre cartes
      return () => clearTimeout(timer);
    }
  }, [isPast, existing, revealed]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (homeScore === '' || awayScore === '') return;
    setLoading(true);
    try {
      await saveProno(match.id, parseInt(homeScore), parseInt(awayScore), joker);
      recordPronoToday();
      setSaved(true);
      if (joker) setJokerAvailable(false);
      setTimeout(() => setSaved(false), 2000);

      const updated = await getPronoForMatch(match.id);
      setExisting(updated);
    } finally {
      setLoading(false);
    }
  }

  function getResultContent() {
    if (!existing) return null;
    const pts = existing.totalPoints ?? 0;
    const isExact = existing.bonusExact && existing.bonusExact > 0;
    const color = pts > 0 ? (isExact ? 'result-gold' : 'result-silver') : 'result-gray';

    return (
      <div className={`flip-result ${color}`}>
        <div className="flip-score">{existing.homeScore} - {existing.awayScore}</div>
        <div className="flip-points">
          {existing.joker && <Zap size={14} className="joker-icon" />}
          <span className="flip-pts-value">{pts}</span>
          <span className="flip-pts-label">pts</span>
        </div>
        {isExact && (
          <div className="flip-exact">
            <Star size={13} /> Score exact ! +{existing.bonusExact} bonus
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`match-card ${effectiveStatus} ${existing?.joker ? 'has-joker' : ''} ${flipped ? 'is-flipped' : ''}`}
    >
      <div className="card-inner">
        {/* FACE AVANT */}
        <div className="card-front">
          <div className="match-meta">
            <div className="match-meta-left">
              <span className="competition">{match.competition}</span>
              {match.phase && <span className="phase-badge">{match.phase}</span>}
            </div>
            <div className="match-meta-right">
              {effectiveStatus === 'upcoming' && (
                <span className="match-localtime">
                  {new Date(match.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  {' '}
                  {new Date(match.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {effectiveStatus === 'upcoming' && <Countdown targetDate={match.date} />}
              {isLive && (
                <span className="status-badge live">
                  <span className="live-dot" />
                  En cours
                </span>
              )}
              {effectiveStatus === 'finished' && <span className="status-badge finished">Terminé</span>}
            </div>
          </div>

          <div className="match-teams">
            <div className="team">
              <FlagImg name={match.homeTeam.name} size={28} />
              <span className="team-name">{match.homeTeam.name}</span>
            </div>
            <div className="match-score">
              {isLive ? (
                <span className="live-score">{match.homeScore ?? 0} - {match.awayScore ?? 0}</span>
              ) : effectiveStatus === 'finished' ? (
                <span className="final-score">{match.homeScore ?? '?'} - {match.awayScore ?? '?'}</span>
              ) : (
                <span className="vs">VS</span>
              )}
            </div>
            <div className="team away">
              <span className="team-name">{match.awayTeam.name}</span>
              <FlagImg name={match.awayTeam.name} size={28} />
            </div>
          </div>

          {match.odds && (() => {
            const { home, draw, away } = match.odds;
            const inv = (v: number) => 1 / v;
            const total = inv(home) + inv(draw) + inv(away);
            const pct = (v: number) => Math.round((inv(v) / total) * 100);
            return (
            <div className="odds-section">
              <div className="odds-header">
                <span className="odds-title">Cotes</span>
                <span className="odds-hint" title="Bonne tendance = 3 pts (victoire) ou 1 pt (nul). Score exact = tendance + bonus cote. Ex : exact sur cote 1.30 → 3 + 13 = 16 pts.">
                  ℹ️ Bonus si score exact
                </span>
              </div>
              <div className="odds-row">
                {[
                  { label: match.homeTeam.name.split(' ')[0], val: home, prob: pct(home) },
                  { label: 'Nul', val: draw, prob: pct(draw) },
                  { label: match.awayTeam.name.split(' ')[0], val: away, prob: pct(away) },
                ].map(({ label, val, prob }) => (
                  <div key={label} className="odd-item">
                    <span className="odd-label">{label}</span>
                    <span className="odd-prob">{prob}%</span>
                    <span className="odd-value">{val.toFixed(2)}</span>
                    <span className="odd-pts">+{Math.round(val * 10)} si exact</span>
                  </div>
                ))}
              </div>
            </div>
            );
          })()}

          {!isPast && (
            <form onSubmit={handleSubmit} className="prono-form">
              <div className="prono-inputs">
                <input type="number" min="0" max="20" value={homeScore}
                  onChange={e => setHomeScore(e.target.value)} placeholder="0" className="score-input" />
                <span className="dash">-</span>
                <input type="number" min="0" max="20" value={awayScore}
                  onChange={e => setAwayScore(e.target.value)} placeholder="0" className="score-input" />
              </div>
              <button type="button"
                onClick={() => setJoker(!joker)}
                className={`btn-joker ${joker ? 'active' : ''} ${!jokerAvailable && !joker ? 'disabled' : ''}`}
                disabled={!jokerAvailable && !joker}
                title={jokerAvailable || joker ? 'Activer bonus X2' : 'Joker déjà utilisé'}
              >
                <Zap size={14} /> X2
              </button>
              <button type="submit" disabled={loading} className="btn-prono">
                {saved ? <><CheckCircle size={14} /> OK</> : loading ? '…' : existing ? 'Modifier' : 'Pronostiquer'}
              </button>
            </form>
          )}

          {isPast && existing && !revealed && (
            <div className="prono-pending">
              <span className="prono-label">Mon prono : {existing.homeScore} - {existing.awayScore}</span>
              <span className="flip-hint">Révélation en cours…</span>
            </div>
          )}

          {isLive && !existing && (
            <div className="prono-locked">
              En cours - Pronos fermés
            </div>
          )}

          {effectiveStatus === 'finished' && !existing && (
            <div className="prono-result no-prono">
              <span className="prono-label">Aucun prono soumis</span>
            </div>
          )}
        </div>

        {/* FACE ARRIÈRE (après flip) */}
        <div className="card-back">
          {getResultContent()}
          <button className="btn-flip-back" onClick={() => { setFlipped(false); }}>
            Voir le match
          </button>
        </div>
      </div>
    </div>
  );
}
