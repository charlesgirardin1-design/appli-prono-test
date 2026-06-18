import React, { useEffect, useState } from 'react';
import { createGroup, getUserGroups, joinGroup, deleteGroup } from '../lib/firestore';
import { Group } from '../types';
import { Users, Plus, Copy, CheckCircle, LogIn, Trash2, Share2, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
    getUserGroups().then(g => {
      setGroups(g);
      setLoading(false);
    });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const g = await createGroup(newName.trim());
    setGroups(prev => [...prev, g]);
    setNewName('');
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setError('');
    const g = await joinGroup(joinCode.trim().toUpperCase());
    if (!g) { setError('Code introuvable. Vérifiez le code et réessayez.'); return; }
    if (!groups.find(x => x.id === g.id)) setGroups(prev => [...prev, g]);
    setJoinCode('');
    setError('');
  }

  async function handleDelete(groupId: string) {
    if (!window.confirm('Quitter / supprimer ce groupe ?')) return;
    await deleteGroup(groupId);
    setGroups(prev => prev.filter(g => g.id !== groupId));
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  function shareGroup(group: Group) {
    const text = `Rejoins mon groupe "${group.name}" sur PronoFoot ! Code : ${group.code}`;
    if (navigator.share) {
      navigator.share({ title: 'PronoFoot - Groupe', text });
    } else {
      navigator.clipboard.writeText(text);
      setCopied('share_' + group.id);
      setTimeout(() => setCopied(null), 2000);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><Users size={24} /> Groupes privés</h1>
        <p className="page-subtitle">Créez un groupe et partagez le code avec vos amis</p>
      </div>

      <div className="card groups-actions">
        <div className="tab-row">
          <button className={`tab ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>
            <Plus size={14} /> Créer un groupe
          </button>
          <button className={`tab ${tab === 'join' ? 'active' : ''}`} onClick={() => setTab('join')}>
            <LogIn size={14} /> Rejoindre
          </button>
        </div>

        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="form-row">
            <input type="text" placeholder="Nom du groupe (ex: Les Potes)" value={newName}
              onChange={e => setNewName(e.target.value)} className="input" maxLength={30} />
            <button type="submit" disabled={!newName.trim()} className="btn-primary">Créer</button>
          </form>
        ) : (
          <div>
            <form onSubmit={handleJoin} className="form-row">
              <input type="text" placeholder="Code du groupe" value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())} className="input" maxLength={12} />
              <button type="submit" disabled={!joinCode.trim()} className="btn-primary">Rejoindre</button>
            </form>
            {error && <p className="error-msg">{error}</p>}
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : groups.length === 0 ? (
        <div className="empty">
          <Users size={48} opacity={0.3} />
          <p>Aucun groupe pour le moment</p>
          <p className="empty-hint">Créez un groupe et partagez le code avec vos amis !</p>
        </div>
      ) : (
        <div className="groups-list">
          {groups.map(g => {
            const isCreator = g.creatorId === currentUser?.uid;
            return (
              <div key={g.id} className="group-card">
                <div className="group-header">
                  <div className="group-name-row">
                    <h3>{g.name}</h3>
                    {isCreator && <span className="badge-creator"><Crown size={12} /> Admin</span>}
                  </div>
                  <span className="members-count">{g.members.length} membre{g.members.length > 1 ? 's' : ''}</span>
                </div>

                <div className="group-code-block">
                  <span className="code-label">Code d'invitation</span>
                  <div className="code-value-row">
                    <code className="group-code-display">{g.code}</code>
                    <button onClick={() => copyCode(g.code)} className="btn-icon" title="Copier le code">
                      {copied === g.code ? <CheckCircle size={16} color="var(--green)" /> : <Copy size={16} />}
                    </button>
                    <button onClick={() => shareGroup(g)} className="btn-icon" title="Partager">
                      {copied === 'share_' + g.id ? <CheckCircle size={16} color="var(--green)" /> : <Share2 size={16} />}
                    </button>
                  </div>
                  <p className="code-hint">Partagez ce code pour inviter vos amis</p>
                </div>

                <div className="group-footer">
                  <button onClick={() => handleDelete(g.id)} className="btn-leave">
                    <Trash2 size={13} /> {isCreator ? 'Supprimer' : 'Quitter'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
