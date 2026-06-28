import React, { useState, useEffect } from 'react';
import { getMatches } from '../lib/firestore';
import { getPlayerId } from '../lib/settings';
import { Match } from '../types/index';
import { Trophy, Lock } from 'lucide-react';

const CHAMPION_KEY = 'pf_champion';
const WINNER_KEY = 'pf_champion_winner';

interface ChampionProno {
  userId: string;
  teamName: string;
  lockedAt: string;
}

export default function ChampionPage() {
  const [teams, setTeams] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [locked, setLocked] = useState<ChampionProno | null>(null);
  const [saved, setSaved] = useState(false);
  const [winner, setWinner] = useState('');

  useEffect(() => {
    getMatches().then((matches: Match[]) => {
      const seen = new Set<string>();
      matches.forEach(m => { seen.add(m.homeTeam.name); seen.add(m.awayTeam.name); });
            setTeams(Array.from(seen).sort((a, b) => a.localeCompare(b)));
    });

    const pid = getPlayerId();
    const all: ChampionProno[] = JSON.parse(localStorage.getItem(CHAMPION_KEY) || '[]');
    const mine = all.find(c => c.userId === pid);
    if (mine) { setLocked(mine); setSelected(mine.teamName); }

    setWinner(localStorage.getItem(WINNER_KEY) ?? '');
  }, []);

  function handleSave() {
    if (!selected || locked?.teamName === selected) return;
    const pid = getPlayerId();
    const all: ChampionProno[] = JSON.parse(localStorage.getItem(CHAMPION_KEY) || '[]');
    const prono: ChampionProno = { userId: pid, teamName: selected, lockedAt: new Date().toISOString() };
    localStorage.setItem(CHAMPION_KEY, JSON.stringify([...all.filter(c => c.userId !== pid), prono]));
    setLocked(prono);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isCorrect = winner && locked?.teamName === winner;
  const finalStarted = winner !== '';

  return (
    <div className="page">
      <div className="page-header">
        <h1><Trophy size={22} /> Champion du Monde</h1>
      </div>

      {/* Résultat si winner annoncé */}
      {winner && (
        <div style={{ background: isCorrect ? '#14532d' : '#1f2937', border: isCorrect ? '1px solid #22c55e' : 'none', borderRadius: 12, padding: '1rem', marginBottom: 14, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem' }}>🏆</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>Champion : {winner}</div>
          {isCorrect && <div style={{ color: '#22c55e', fontWeight: 700, marginTop: 6 }}>+100 pts — Bravo, tu avais prédit le bon champion !</div>}
          {!isCorrect && locked && <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: 4 }}>Tu avais misé sur {locked.teamName}</div>}
        </div>
      )}

      {/* Prono actuel */}
      {locked && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem', marginBottom: 14 }}>
          <Trophy size={22} color="#f59e0b" />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Ton pronostic champion</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{locked.teamName}</div>
          </div>
          {isCorrect && <span style={{ marginLeft: 'auto', color: '#f59e0b', fontWeight: 800 }}>+100 pts</span>}
          {finalStarted && !isCorrect && <Lock size={16} color="#6b7280" style={{ marginLeft: 'auto' }} />}
        </div>
      )}

      <div className="card">
        <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: 16 }}>
          Sélectionne l'équipe qui va remporter la Coupe du Monde 2026.
          Bonus <strong style={{ color: '#f59e0b' }}>+100 pts</strong> si tu as raison !
          {!finalStarted && ' Tu peux modifier ton choix avant la finale.'}
        </p>

        {finalStarted && !isCorrect ? (
          <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>Le tournoi est terminé — modification impossible.</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginBottom: 14 }}>
              {teams.map(name => (
                <button
                  key={name}
                  onClick={() => !finalStarted && setSelected(name)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: selected === name ? '2px solid #f59e0b' : '1px solid #374151',
                    background: selected === name ? '#451a03' : '#111827',
                    color: selected === name ? '#fbbf24' : '#e5e7eb',
                    cursor: finalStarted ? 'default' : 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: selected === name ? 700 : 400,
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={!selected || finalStarted}
              style={{
                padding: '10px 22px', background: '#f59e0b', border: 'none', borderRadius: 8,
                color: '#111', fontWeight: 700, cursor: selected && !finalStarted ? 'pointer' : 'not-allowed',
                opacity: selected && !finalStarted ? 1 : 0.4,
              }}
            >
              {saved ? '✓ Sauvegardé !' : locked ? 'Modifier mon champion' : 'Valider mon champion'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
