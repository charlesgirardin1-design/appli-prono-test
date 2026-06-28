import React, { useEffect, useState } from 'react';
import { getMatches, getPronos } from '../lib/firestore';
import { Match, Prono } from '../types';
import MatchCard from '../components/MatchCard';
import { Calendar, Flame } from 'lucide-react';
import { useStreak } from '../hooks/useStreak';
import { getEffectiveStatus } from '../lib/matchStatus';

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [pronos, setPronos] = useState<Prono[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'live' | 'finished' | 'all'>('upcoming');
  const streak = useStreak();

  const loadData = () => {
    Promise.all([getMatches(), getPronos()]).then(([m, p]) => {
      setMatches(m);
      setPronos(p);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener('pf_matches_updated', loadData);
    const interval = setInterval(loadData, 60_000);
    return () => {
      window.removeEventListener('pf_matches_updated', loadData);
      clearInterval(interval);
    };
  }, []);

  const filtered = matches
    .filter(m => filter === 'all' || getEffectiveStatus(m) === filter)
    .sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      // Terminés : plus récent en premier
      if (filter === 'finished') return db - da;
      // À venir / live / tous : plus proche en premier
      return da - db;
    });
  const upcomingCount = matches.filter(m => getEffectiveStatus(m) === 'upcoming').length;
  const liveCount = matches.filter(m => getEffectiveStatus(m) === 'live').length;
  const pronosCount = pronos.filter(p =>
    matches.find(m => m.id === p.matchId && getEffectiveStatus(m) === 'upcoming')
  ).length;
  const progressPct = upcomingCount > 0 ? Math.round((pronosCount / upcomingCount) * 100) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1><Calendar size={24} /> Matchs</h1>
        <div className="header-right">
          {streak >= 2 && (
            <div className="streak-badge">
              <Flame size={16} />
              <span>{streak} jours</span>
            </div>
          )}
          <div className="filter-tabs">
            {(['upcoming', 'live', 'finished', 'all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`tab ${filter === f ? 'active' : ''} ${f === 'live' && liveCount > 0 ? 'live-tab' : ''}`}>
                {f === 'upcoming' ? 'À venir' : f === 'live' ? `En cours${liveCount > 0 ? ` (${liveCount})` : ''}` : f === 'finished' ? 'Terminés' : 'Tous'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Barre de progression des pronos */}
      {upcomingCount > 0 && (
        <div className="progress-bar-wrap">
          <div className="progress-bar-info">
            <span>{pronosCount}/{upcomingCount} matchs pronostiqués</span>
            <span className="progress-pct">{progressPct}%</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <Calendar size={48} opacity={0.3} />
          <p>Aucun match pour le moment</p>
        </div>
      ) : (
        <div className="matches-grid">
          {filtered.map(m => <MatchCard key={m.id} match={m} />)}
        </div>
      )}
    </div>
  );
}
