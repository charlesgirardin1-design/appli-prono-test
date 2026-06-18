import React, { useEffect, useState } from 'react';
import { getLeaderboard, getUserGroups } from '../lib/firestore';
import { LeaderboardEntry, Group } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Trophy, Target, TrendingUp } from 'lucide-react';

export default function Classement() {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('global');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    getUserGroups(currentUser.uid).then(setGroups);
  }, [currentUser]);

  useEffect(() => {
    setLoading(true);
    const members = selectedGroup !== 'global'
      ? groups.find(g => g.id === selectedGroup)?.members
      : undefined;
    getLeaderboard(members).then(l => {
      setLeaderboard(l);
      setLoading(false);
    });
  }, [selectedGroup, groups]);

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
        <select
          value={selectedGroup}
          onChange={e => setSelectedGroup(e.target.value)}
          className="select"
        >
          <option value="global">Général</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
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
            <div
              key={entry.userId}
              className={`leaderboard-row ${entry.userId === currentUser?.uid ? 'me' : ''} ${i < 3 ? 'top' : ''}`}
            >
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
