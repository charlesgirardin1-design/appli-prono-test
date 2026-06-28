import React, { useState, useEffect } from 'react';
import { getAllUsers, banUser, unbanUser, isAdmin, ADMIN_UIDS } from '../lib/auth';
import { getMatches, updateMatchScore } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, UserX, UserCheck, Edit2, Check, X } from 'lucide-react';
import { Match } from '../types';

export default function Admin() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<ReturnType<typeof getAllUsers>>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tab, setTab] = useState<'scores' | 'users'>('scores');
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editHome, setEditHome] = useState('');
  const [editAway, setEditAway] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!currentUser || !isAdmin(currentUser.uid)) {
      navigate('/');
      return;
    }
    setUsers(getAllUsers());
    getMatches().then(setMatches);
  }, [currentUser, navigate]);

  if (!currentUser || !isAdmin(currentUser.uid)) return null;

  function flash(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  }

  async function handleSaveScore(matchId: string) {
    const h = parseInt(editHome);
    const a = parseInt(editAway);
    if (isNaN(h) || isNaN(a)) return;
    await updateMatchScore(matchId, h, a);
    const updated = await getMatches();
    setMatches(updated);
    setEditingMatch(null);
    flash('Score mis a jour !');
  }

  function handleBan(uid: string) {
    try { banUser(uid); setUsers(getAllUsers()); flash('Utilisateur banni.'); }
    catch (e: any) { flash(e.message); }
  }

  function handleUnban(uid: string) {
    try { unbanUser(uid); setUsers(getAllUsers()); flash('Utilisateur debanni.'); }
    catch (e: any) { flash(e.message); }
  }

  const finishedMatches = matches.filter(m => m.status === 'finished');
  const upcomingMatches = matches.filter(m => m.status !== 'finished');

  const btnStyle = (active: boolean) => ({
    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: active ? '#f59e0b' : '#374151', color: '#fff', fontWeight: 600,
  } as React.CSSProperties);

  const rowStyle: React.CSSProperties = {
    background: '#1f2937', borderRadius: 10, padding: '10px 14px',
    display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
  };

  const inputStyle: React.CSSProperties = {
    width: 48, padding: '4px 6px', borderRadius: 6,
    border: '1px solid #4b5563', background: '#111827', color: '#fff', textAlign: 'center',
  };

  function ScoreEdit({ m }: { m: Match }) {
    return editingMatch === m.id ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="number" min="0" max="20" value={editHome}
          onChange={e => setEditHome(e.target.value)} style={inputStyle} />
        <span style={{ color: '#9ca3af' }}>-</span>
        <input type="number" min="0" max="20" value={editAway}
          onChange={e => setEditAway(e.target.value)} style={inputStyle} />
        <button onClick={() => handleSaveScore(m.id)}
          style={{ background: '#22c55e', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>
          <Check size={14} color="#fff" />
        </button>
        <button onClick={() => setEditingMatch(null)}
          style={{ background: '#ef4444', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>
          <X size={14} color="#fff" />
        </button>
      </div>
    ) : (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {m.status === 'finished' && (
          <span style={{ fontWeight: 700, color: '#f59e0b' }}>{m.homeScore ?? '?'} - {m.awayScore ?? '?'}</span>
        )}
        <button onClick={() => { setEditingMatch(m.id); setEditHome(String(m.homeScore ?? 0)); setEditAway(String(m.awayScore ?? 0)); }}
          style={{ background: '#374151', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#d1d5db', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Edit2 size={13} /> {m.status === 'finished' ? 'Modifier' : 'Saisir'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Shield size={24} color="#f59e0b" />
        <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Administration</h1>
      </div>

      {msg && (
        <div style={{ background: '#22c55e', color: '#fff', padding: '8px 14px', borderRadius: 8, marginBottom: 12 }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('scores')} style={btnStyle(tab === 'scores')}>Scores</button>
        <button onClick={() => setTab('users')} style={btnStyle(tab === 'users')}>Utilisateurs ({users.length})</button>
      </div>

      {tab === 'scores' && (
        <div>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: 10 }}>Matchs termines</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {finishedMatches.map(m => (
              <div key={m.id} style={rowStyle}>
                <span style={{ flex: 1, minWidth: 160, fontSize: '0.9rem' }}>{m.homeTeam.name} vs {m.awayTeam.name}</span>
                <ScoreEdit m={m} />
              </div>
            ))}
          </div>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: 10 }}>Matchs a venir</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingMatches.map(m => (
              <div key={m.id} style={rowStyle}>
                <span style={{ flex: 1, minWidth: 160, fontSize: '0.9rem' }}>{m.homeTeam.name} vs {m.awayTeam.name}</span>
                <ScoreEdit m={m} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map(u => {
            const admin = ADMIN_UIDS.includes(u.uid);
            return (
              <div key={u.uid} style={{ ...rowStyle, opacity: u.isBanned ? 0.6 : 1 }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {u.displayName}
                    {admin && <Shield size={13} color="#f59e0b" />}
                    {u.isBanned && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>BANNI</span>}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{u.email}</div>
                </div>
                {!admin && (
                  u.isBanned
                    ? <button onClick={() => handleUnban(u.uid)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#22c55e', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontSize: '0.85rem' }}><UserCheck size={14} /> Debannir</button>
                    : <button onClick={() => handleBan(u.uid)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ef4444', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontSize: '0.85rem' }}><UserX size={14} /> Bannir</button>
                )}
              </div>
            );
          })}
          {users.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center' }}>Aucun utilisateur inscrit.</p>}
        </div>
      )}
    </div>
  );
}
