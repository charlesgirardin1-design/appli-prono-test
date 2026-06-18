import React, { useEffect, useState } from 'react';
import { getMatches } from '../lib/firestore';
import { Match } from '../types';
import MatchCard from '../components/MatchCard';
import { Calendar } from 'lucide-react';

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'finished'>('upcoming');

  useEffect(() => {
    getMatches().then(m => {
      setMatches(m);
      setLoading(false);
    });
  }, []);

  const filtered = matches.filter(m => filter === 'all' || m.status === filter);

  return (
    <div className="page">
      <div className="page-header">
        <h1><Calendar size={24} /> Matchs</h1>
        <div className="filter-tabs">
          {(['upcoming', 'finished', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`tab ${filter === f ? 'active' : ''}`}
            >
              {f === 'upcoming' ? 'À venir' : f === 'finished' ? 'Terminés' : 'Tous'}
            </button>
          ))}
        </div>
      </div>

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
