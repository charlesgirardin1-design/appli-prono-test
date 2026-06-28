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
  const [teams, setTeams] = useState<string[]>([]);
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

  // Équipes uniques, triées alphabétiquement
  useEffect(() => {
    const seen = new Set<string>();
    matches.forEach(m => { seen.add(m.homeTeam.name); seen.add(m.awayTeam.name); });
    setTeams(Array.from(seen).sort((a, b) => a.localeCompare(b)));
  }, [matches]);

  const upcomingCount = matches.filter(m => getEffectiveStatus(m) === 'upcoming').length;
  const liveCount = matches.filter(m => getEffectiveStatus(m) === 'live').length;
  const pronosCount = pronos.filter(p =>
    matches.find(m => m.id === p.matchId && getEffectiveStatus(m) === 'upcoming')
  ).length;
  const progressPct = upcomingCount > 0 ? Math.round((pronosCount / upcomingCount) * 100) : 0;

  let filtered = matches.filter(m => {
    const status = getEffectiveStatus(m);
    if (filter !== 'all' && status !== filter) return false;
    if (filterPhase && m.phase !== filterPhase) return false;
    if (filterTeam && m.homeTeam.name !== filterTeam && m.awayTeam.name !== filterTeam) return false;
    return true;
  });

  // Trier les matchs terminés du plus récent au plus ancien
  if (filter === 'finished') {
    filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const hasSubFilters = filterPhase || filterTeam;

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

      {/* Sous-filtres phase + équipe */}
      <div className="sub-filters">
        <div className="phase-filters">
          {PHASES.map(ph => (
            <button
              key={ph}
              className={`phase-btn ${filterPhase === ph ? 'active' : ''}`}
              onClick={() => setFilterPhase(prev => prev === ph ? '' : ph)}
            >
              {PHASE_LABELS[ph]}
            </button>
          ))}
        </div>
        <select
          className="team-select"
          value={filterTeam}
          onChange={e => setFilterTeam(e.target.value)}
        >
          <option value="">Toutes équipes</option>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {hasSubFilters && (
          <button className="clear-filters-btn" onClick={() => { setFilterPhase(''); setFilterTeam(''); }}>
            ✕ Effacer
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
