import React, { useState, useEffect } from 'react';
import { getPronos, getMatches } from '../lib/firestore';
import { getCurrentUser } from '../lib/auth';
import { Match, Prono } from '../types/index';
import { User, Target, TrendingUp, Star, Award, CheckCircle } from 'lucide-react';

export default function ProfilPage() {
  const [pronos, setPronos] = useState<Prono[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const user = getCurrentUser();

  useEffect(() => {
    getPronos().then(setPronos);
    getMatches().then(setMatches);
  }, []);

  const played = pronos.filter(p => p.totalPoints !== undefined);
  const correct = played.filter(p => (p.points ?? 0) > 0);
  const exact = played.filter(p => (p.bonusExact ?? 0) > 0);
  const totalPoints = played.reduce((s, p) => s + (p.totalPoints ?? 0), 0);
  const bestMatch = played.length ? Math.max(...played.map(p => p.totalPoints ?? 0)) : 0;
  const winRate = played.length ? Math.round(correct.length / played.length * 100) : 0;

  let bestOdds = 0;
  correct.forEach(p => {
    const m = matches.find(x => x.id === p.matchId);
    if (m?.odds && m.homeScore !== undefined && m.awayScore !== undefined) {
      const trend = Math.sign(m.homeScore - m.awayScore);
      const o = trend > 0 ? m.odds.home : trend === 0 ? m.odds.draw : m.odds.away;
      if (o > bestOdds) bestOdds = o;
    }
  });

  function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
      <div style={{ background: '#1f2937', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 130px' }}>
        <div style={{ color: '#f59e0b' }}>{icon}</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.3 }}>{label}</div>
      </div>
    );
  }

  const recentPlayed = [...played]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="page">
      <div className="page-header">
        <h1><User size={22} /> Mon profil</h1>
      </div>

      {/* Carte identité */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1.2rem', marginBottom: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: '#111', flexShrink: 0 }}>
          {user?.displayName?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user?.displayName ?? 'Joueur'}</div>
          <div style={{ color: '#6b7280', fontSize: '0.78rem' }}>{user?.email}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>{totalPoints}</div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>pts totaux</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <StatCard icon={<Target size={16} />} label="Pronos joués" value={played.length} />
        <StatCard icon={<TrendingUp size={16} />} label="Taux de réussite" value={winRate + '%'} />
        <StatCard icon={<CheckCircle size={16} />} label="Scores exacts" value={exact.length} />
        <StatCard icon={<Award size={16} />} label="Meilleur match" value={bestMatch + ' pts'} />
        <StatCard icon={<Star size={16} />} label="Meilleure cote" value={bestOdds > 0 ? bestOdds.toFixed(2) : '—'} />
        <StatCard icon={<Target size={16} />} label="Bons pronos" value={correct.length + '/' + played.length} />
      </div>

      {/* Historique récent */}
      {recentPlayed.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Derniers résultats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentPlayed.map(p => {
              const m = matches.find(x => x.id === p.matchId);
              if (!m) return null;
              const won = (p.points ?? 0) > 0;
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #111827' }}>
                  <span style={{ fontSize: '1.1rem', width: 22, textAlign: 'center' }}>{p.totalPoints === undefined ? '⏳' : won ? '✅' : '❌'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.homeTeam.name} vs {m.awayTeam.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Prono : {p.homeScore}–{p.awayScore}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {p.totalPoints !== undefined ? (
                      <span style={{ fontWeight: 700, color: won ? '#22c55e' : '#6b7280' }}>
                        {won ? '+' : ''}{p.totalPoints} pts
                      </span>
                    ) : (
                      <span style={{ color: '#4b5563', fontSize: '0.8rem' }}>en attente</span>
                    )}
                    {p.joker && <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>⚡ joker</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {played.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          <p>Aucun prono terminé pour l'instant.</p>
          <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Tes stats apparaîtront ici après les premiers matchs.</p>
        </div>
      )}
    </div>
  );
}
