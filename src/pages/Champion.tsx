import React, { useState, useEffect } from 'react';
import { getMatches } from '../lib/firestore';
import { getPlayerId } from '../lib/settings';
import { Match } from '../types/index';
import { Trophy, Lock, Edit3, CheckCircle } from 'lucide-react';
import { FlagImg } from '../lib/flags';
import { fireConfetti } from '../hooks/useConfetti';

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

  const finalStarted = winner !== '';
  const isCorrect = !!(winner && locked?.teamName === winner);
  const hasChange = selected !== '' && selected !== locked?.teamName;

  function handleSave() {
    if (!selected || !hasChange || finalStarted) return;
    const pid = getPlayerId();
    const all: ChampionProno[] = JSON.parse(localStorage.getItem(CHAMPION_KEY) || '[]');
    const prono: ChampionProno = { userId: pid, teamName: selected, lockedAt: new Date().toISOString() };
    localStorage.setItem(CHAMPION_KEY, JSON.stringify([...all.filter(c => c.userId !== pid), prono]));
    setLocked(prono);
    setSaved(true);
    fireConfetti();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><Trophy size={22} /> Champion du Monde</h1>
      </div>

      {winner && (
        <div style={{ background: isCorrect ? '#14532d' : '#1f2937', border: `1px solid ${isCorrect ? '#22c55e' : '#374151'}`, borderRadius: 12, padding: '1rem', marginBottom: 14, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem' }}>🏆</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>Champion : {winner}</div>
          {isCorrect && <div style={{ color: '#22c55e', fontWeight: 700, marginTop: 6 }}>+100 pts — Bravo, tu avais prédit le bon champion !</div>}
          {!isCorrect && locked && <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: 4 }}>Tu avais misé sur {locked.teamName}</div>}
        </div>
      )}

      {locked && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem', marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, background: 'rgba(245,158,11,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Trophy size={20} color="#f59e0b" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ton champion actuel</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1.05rem' }}>
              <FlagImg name={locked.teamName} size={20} />
              {locked.teamName}
            </div>
          </div>
          {!finalStarted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: '0.78rem', background: 'rgba(107,114,128,0.1)', padding: '4px 8px', borderRadius: 6 }}>
              <Edit3 size={12} /> Modifiable
            </div>
          )}
          {isCorrect && <span style={{ color: '#f59e0b', fontWeight: 800 }}>+100 pts 🎉</span>}
          {finalStarted && !isCorrect && <Lock size={16} color="#6b7280" />}
        </div>
      )}

      {saved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', color: '#22c55e', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: 14, animation: 'pop-in 0.3s ease' }}>
          <CheckCircle size={18} /> Champion mis à jour !
        </div>
      )}

      <div className="card">
        {finalStarted ? (
          <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>Le tournoi est terminé — modification impossible.</p>
        ) : (
          <>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Edit3 size={14} color="#9ca3af" />
              Clique sur une équipe pour {locked ? 'changer ton choix' : 'faire ton pronostic'}. Tu peux modifier jusqu'à la finale. Bonus <strong style={{ color: '#f59e0b' }}>+100 pts</strong> si tu as raison !
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginBottom: 16 }}>
              {teams.map(name => {
                const isSelected = selected === name;
                const isLockedPick = locked?.teamName === name;
                return (
                  <button
                    key={name}
                    onClick={() => setSelected(name)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: isSelected ? '2px solid #f59e0b' : isLockedPick ? '1px solid #4b5563' : '1px solid #374151',
                      background: isSelected ? '#451a03' : '#111827',
                      color: isSelected ? '#fbbf24' : '#e5e7eb',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 700 : 400,
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <FlagImg name={name} size={16} />
                    {name}
                    {isLockedPick && !isSelected && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#6b7280' }}>actuel</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSave}
              disabled={!selected || !hasChange}
              style={{
                padding: '10px 22px',
                background: hasChange ? '#f59e0b' : '#1f2937',
                border: hasChange ? 'none' : '1px solid #374151',
                borderRadius: 8,
                color: hasChange ? '#111' : '#6b7280',
                fontWeight: 700,
                cursor: hasChange ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.9rem',
              }}
            >
              <Trophy size={16} />
              {!selected ? 'Sélectionne une équipe' : !hasChange ? 'Même équipe que ton choix actuel' : locked ? 'Modifier mon champion' : 'Valider mon champion'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
