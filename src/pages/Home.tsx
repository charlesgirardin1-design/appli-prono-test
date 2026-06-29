import React, { useEffect, useState } from 'react';
import { getMatches, getPronos } from '../lib/firestore';
import { Match, Prono } from '../types';
import MatchCard from '../components/MatchCard';
import { Calendar, Flame } from 'lucide-react';
import { useStreak } from '../hooks/useStreak';
import { getEffectiveStatus } from '../lib/matchStatus';

function formatDateBtn(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function isoDay(iso: string): string {
  return iso.slice(0, 10);
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [pronos, setPronos] = useState<Prono[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'live' | 'finished' | 'all'>('upcoming');
  const [filterDate, setFilterDate] = useState<string | null>(null);
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

  function handleFilterChange(f: typeof filter) {
    setFilter(f);
    if (f === 'finished') {
      const days = matches
        .filter(m => getEffectiveStatus(m) === 'finished')
        .map(m => isoDay(m.date))
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => b.localeCompare(a));
      setFilterDate(days[0] ?? null);
    } else {
      setFilterDate(null);
    }
  }

  const finishedMatches = matches.filter(m => getEffectiveStatus(m) === 'finished');
  const finishedDays = Array.from(new Set(finishedMatches.map(m => isoDay(m.date)))).sort((a, b) => b.localeCompare(a));

  const filtered = (() => {
    if (filter === 'finished') {
      const base = filterDate
        ? finishedMatches.filter(m => isoDay(m.date) === filterDate)
        : finishedMatches;
      return [...base].sort((a, b) => b.date.localeCompare(a.date));
    }
    return matches.filter(m => filter === 'all' || getEffectiveStatus(m) === filter);
  })();

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
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`tab ${filter === f ? 'active' : ''} ${f === 'live' && liveCount > 0 ? 'live-tab' : ''}`}
              >
                {f === 'upcoming' ? 'À venir' : f === 'live' ? `En cours${liveCount > 0 ? ` (${liveCount})` : ''}` : f === 'finished' ? 'Terminés' : 'Tous'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filter === 'finished' && finishedDays.length > 1 && (
        <div className="date-filter-row">
          {finishedDays.map(day => (
            <button
              key={day}
              onClick={() => setFilterDate(day)}
              className={`date-btn ${filterDate === day ? 'active' : ''}`}
            >
              {formatDateBtn(day + 'T12:00:00')}
            </button>
          ))}
        </div>
      )}

      {upcomingCount > 0 && (
        <div className="progress-bar-wrap">
          <div className="progress-bar-info">
            <span>{pronosCount}/{upcomingCount} matchs pronostiqués</span>
            <span className="progress-pct">{progressPct}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
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
