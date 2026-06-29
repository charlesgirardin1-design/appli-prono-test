import React, { useEffect, useState, useRef } from 'react';
import { getLeaderboard } from '../lib/firestore';
import { LeaderboardEntry } from '../types';
import { BarChart3, Trophy, Target, TrendingUp } from 'lucide-react';

function useCountUp(target: number, duration = 600) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

function AnimatedPoints({ value }: { value: number }) {
  const displayed = useCountUp(value, 700);
  return <span className="points">{displayed} pts</span>;
}

function SkeletonLeaderboard() {
  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <span>#</span><span>Joueur</span><span>Exact</span><span>Tendance</span><span>Points</span>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="leaderboard-row" style={{ animationDelay: i * 50 + 'ms' }}>
          <span className="rank skeleton" style={{ width: 24, height: 18, display: 'block' }} />
          <span className="skeleton" style={{ width: '55%', height: 16, display: 'block', borderRadius: 4 }} />
          <span className="skeleton" style={{ width: 28, height: 16, display: 'block', borderRadius: 4 }} />
          <span className="skeleton" style={{ width: 28, height: 16, display: 'block', borderRadius: 4 }} />
          <span className="skeleton" style={{ width: 52, height: 16, display: 'block', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

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
        <SkeletonLeaderboard />
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
            <div key={entry.userId} className={`leaderboard-row ${i < 3 ? 'top' : ''}`} style={{ animationDelay: `${i * 50}ms` }}>
              <span className="rank">{getMedal(i)}</span>
              <span className="player-name">{entry.displayName}</span>
              <span>{entry.exactScores}</span>
              <span>{entry.correctTrends}</span>
              <AnimatedPoints value={entry.totalPoints} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
