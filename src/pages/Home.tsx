import React, { useEffect, useState } from 'react';
import { getMatches, getPronos } from '../lib/firestore';
import { Match, Prono } from '../types';
import MatchCard from '../components/MatchCard';
import { Calendar, Flame } from 'lucide-react';
import { useStreak } from '../hooks/useStreak';
import { getEffectiveStatus } from '../lib/matchStatus';

const PHASES = [
  'Phase de groupes',
  'Huitièmes de finale',
  'Quarts de finale',
  'Demi-finale',
  'Finale',
];

const PHASE_LABELS: Record<string, string> = {
  'Phase de groupes': 'Poules',
  'Huitièmes de finale': '8èmes',
  'Quarts de finale': 'Quarts',
  'Demi-finale': 'Demis',
  'Finale': 'Finale',
};

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [pronos, setPronos] = useState<Prono[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'live' | 'finished' | 'all'>('upcoming');
  const [filterPhase, setFilterPhase] = useState<string>('');
  const [filterTeam, setFilterTeam] = useState<string>('');
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

  // Equipes uniques triées alphabétiquement
  const allTeams = Array.from(new Set(
    matches.flatMap(m => [m.homeTeam.name, m.awayTeam.name])
  )).sort();

  const filtered = matches
    .filter(m => {
      if (filter !== 'all' && getEffectiveStatus(m) !== filter) return false;
      if (filterPhase && m.phase !== filterPhase) return false;
      if (filterTeam && m.homeTeam.name !== filterTeam && m.awayTeam.name !== filterTeam) return false;
      return true;
    })
    .sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      if (filter === 'finished') return db - da;
      return da - db;
    });

  const upcomingCount = matches.filter(m => getEffectiveStatus(m) === 'upcoming').length;
  const liveCount = matches.filter(m => getEffectiveStatus(m) === 'live').length;
  const pronosCount = pronos.filter(p =>
    matches.find(m => m.id === p.matchId && getEffectiveStatus(m) === 'upcoming')
  ).length;
  const progressPct = upcomingCount > 0 ? Math.round((pronosCount / upcomingCount) * 100) : 0;

  const hasActiveSubFilter = filterPhase !== '' || filterTeam !== '';

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

      {/* Filtres phase + pays */}
      <div className="sub-filters">
        <div className="phase-filters">
          <button
            className={`phase-btn ${filterPhase === '' ? 'active' : ''}`}
            onClick={() => setFilterPhase('')}
          >
            Toutes
          </button>
          {PHASES.map(p => (
            <button
              key={p}
              className={`phase-btn ${filterPhase === p ? 'active' : ''}`}
              onClick={() => setFilterPhase(filterPhase === p ? '' : p)}
            >
              {PHASE_LABELS[p]}
            </button>
          ))}
        </div>
        <select
          className="team-select"
          value={filterTeam}
          onChange={e => setFilterTeam(e.target.value)}
        >
          <option value="">Tous les pays</option>
          {allTeams.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {hasActiveSubFilter && (
          <button className="clear-filters-btn" onClick={() => { setFilterPhase(''); setFilterTeam(''); }}>
            Réinitialiser
          </button>
        )}
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
