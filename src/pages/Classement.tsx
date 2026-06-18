import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../lib/firestore';
import { LeaderboardEntry } from '../types';
import { BarChart3, Trophy, Target, TrendingUp } from 'lucide-react';

export default function Classement() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLeaderboard().then(l => {
      setLeaderboard(l);
      setLoading(false);
    });
  }, []);

  function getMedal(rank: number) {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `${rank + 1}`;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><BarChart3 size={24} /> Classement</h1>
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : leaderboard.length === 0 ? (
        <div className="empty">
          <Trophy size={48} opacity={0.3} />
          <p>Aucun pronostic enregistré</p>
        </div>
      ) : (
        <div className="leaderboard">
          <div className="leaderboard-header">
            <span>#</span>
            <span>Joueur</span>
            <span><Target size={14} /> Exact</span>
            <span><TrendingUp size={14} /> Tendance</span>
            <span><Trophy size={14} /> Points</span>
          </div>
          {leaderboard.map((entry, i) => (
            <div key={entry.userId} className={`leaderboard-row ${i < 3 ? 'top' : ''}`}>
              <span className="rank">{getMedal(i)}</span>
              <span className="player-name">{entry.displayName}</span>
              <span>{entry.exactScores}</span>
              <span>{entry.correctTrends}</span>
              <span className="points">{entry.totalPoints} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
