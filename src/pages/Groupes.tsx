import React, { useEffect, useState } from 'react';
import { createGroup, getUserGroups, joinGroup } from '../lib/firestore';
import { Group } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Copy, CheckCircle, LogIn } from 'lucide-react';

export default function Groupes() {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'create' | 'join'>('create');

  useEffect(() => {
    if (!currentUser) return;
    getUserGroups(currentUser.uid).then(g => {
      setGroups(g);
      setLoading(false);
    });
  }, [currentUser]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !newName.trim()) return;
    const g = await createGroup(newName.trim(), currentUser.uid);
    setGroups(prev => [...prev, g]);
    setNewName('');
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !joinCode.trim()) return;
    setError('');
    const g = await joinGroup(joinCode.trim().toUpperCase(), currentUser.uid);
    if (!g) {
      setError('Code introuvable');
      return;
    }
    if (!groups.find(x => x.id === g.id)) {
      setGroups(prev => [...prev, g]);
    }
    setJoinCode('');
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><Users size={24} /> Groupes</h1>
      </div>

      <div className="card">
        <div className="tab-row">
          <button className={`tab ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>
            <Plus size={14} /> Créer
          </button>
          <button className={`tab ${tab === 'join' ? 'active' : ''}`} onClick={() => setTab('join')}>
            <LogIn size={14} /> Rejoindre
          </button>
        </div>

        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="form-row">
            <input
              type="text"
              placeholder="Nom du groupe"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="input"
            />
            <button type="submit" className="btn-primary">Créer</button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="form-row">
            <input
              type="text"
              placeholder="Code d'invitation (ex: ABC123)"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              className="input"
              maxLength={6}
            />
            <button type="submit" className="btn-primary">Rejoindre</button>
          </form>
        )}
        {error && <p className="error">{error}</p>}
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : groups.length === 0 ? (
        <div className="empty">
          <Users size={48} opacity={0.3} />
          <p>Vous n'avez pas encore de groupe</p>
        </div>
      ) : (
        <div className="groups-list">
          {groups.map(g => (
            <div key={g.id} className="group-card">
              <div className="group-info">
                <h3>{g.name}</h3>
                <span className="members-count">{g.members.length} membre{g.members.length > 1 ? 's' : ''}</span>
              </div>
              <div className="group-code">
                <span>Code : <strong>{g.code}</strong></span>
                <button onClick={() => copyCode(g.code)} className="btn-icon" title="Copier">
                  {copied === g.code ? <CheckCircle size={16} color="green" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
