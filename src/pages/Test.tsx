import React, { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { db } from '../lib/storage';
import { Match } from '../types';
import { getEffectiveStatus } from '../lib/matchStatus';
import { fetchAndUpdateScores } from '../lib/liveScores';

const API_KEY = 'e17c642125d94af9bf0b31676463b862';

export default function TestPage() {
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [editHome, setEditHome] = useState('');
  const [editAway, setEditAway] = useState('');

  function addLog(msg: string, color?: string) {
    const time = new Date().toLocaleTimeString('fr-FR');
    setLog(prev => [color ? `__${color}__[${time}] ${msg}` : `[${time}] ${msg}`, ...prev]);
  }

  async function diagnoseApi() {
    setLoading(true);
    addLog('=== SONDAGE API RapidAPI (free-api-live-football-data) ===');

    const endpoints = ['competitions', 'live', 'today', 'worldcup', 'worldcup2', 'worldcup3', 'finished'];
    for (const ep of endpoints) {
      try {
        addLog(`Test endpoint: ${ep}...`);
        const r = await fetch(`/api/scores?endpoint=${ep}`);
        addLog(`  HTTP ${r.status}`);
        const data = await r.json();
        addLog(`  Réponse brute: ${JSON.stringify(data).slice(0, 300)}`);
      } catch (e: any) {
        addLog(`  Erreur: ${e.message}`, 'red');
      }
    }

    setLoading(false);
  }

  async function forceUpdate() {
    setLoading(true);
    addLog('=== MISE À JOUR FORCÉE (via fetchAndUpdateScores) ===');
    const apiKey = localStorage.getItem('pf_football_api_key') || API_KEY;
    const before: Match[] = db.get<Match>('pf_matches');
    const beforeFinished = before.filter(m => m.status === 'finished').length;
    try {
      await fetchAndUpdateScores(apiKey);
      const after: Match[] = db.get<Match>('pf_matches');
      const afterFinished = after.filter(m => m.status === 'finished').length;
      const withScore = after.filter(m => m.status === 'finished' && m.homeScore !== undefined);
      addLog(`Terminés : ${beforeFinished} → ${afterFinished}, avec score : ${withScore.length}`, 'green');
      withScore.slice(0, 10).forEach(m => {
        addLog(`  ✅ ${m.homeTeam.name} ${m.homeScore}-${m.awayScore} ${m.awayTeam.name}`);
      });
      const live = after.filter(m => m.status === 'live');
      if (live.length > 0) {
        addLog(`En cours : ${live.length}`);
        live.forEach(m => addLog(`  🔴 ${m.homeTeam.name} ${m.homeScore ?? 0}-${m.awayScore ?? 0} ${m.awayTeam.name}`, 'green'));
      }
    } catch (e: any) {
      addLog(`Erreur : ${e.message}`, 'red');
    } finally {
      setLoading(false);
    }
  }

  function checkLocal() {
    const matches: Match[] = db.get<Match>('pf_matches');
    addLog(`=== DONNÉES LOCALES (${matches.length} matchs) ===`);
    matches.forEach(m => {
      const eff = getEffectiveStatus(m);
      if (eff === 'live' || eff === 'finished') {
        addLog(`${eff === 'live' ? '🔴' : '✅'} ${m.homeTeam.name} ${m.homeScore ?? '?'}-${m.awayScore ?? '?'} ${m.awayTeam.name} [stored:${m.status}] [eff:${eff}]`);
      }
    });
    const upcomingCount = matches.filter(m => getEffectiveStatus(m) === 'upcoming').length;
    addLog(`À venir : ${upcomingCount}, live/terminés affichés ci-dessus`);
  }

  function saveManual() {
    if (!editMatch) return;
    const h = parseInt(editHome);
    const a = parseInt(editAway);
    if (isNaN(h) || isNaN(a)) return;
    const all: Match[] = db.get<Match>('pf_matches');
    const updated = all.map(m =>
      m.id === editMatch.id ? { ...m, homeScore: h, awayScore: a, status: 'finished' as const } : m
    );
    db.set('pf_matches', updated);
    window.dispatchEvent(new Event('pf_matches_updated'));
    addLog(`✅ Score enregistré manuellement : ${editMatch.homeTeam.name} ${h}-${a} ${editMatch.awayTeam.name}`, 'green');
    setEditMatch(null);
    setEditHome('');
    setEditAway('');
  }

  const allMatches: Match[] = db.get<Match>('pf_matches');
  const pastMatches = allMatches.filter(m => {
    const eff = getEffectiveStatus(m);
    return eff === 'live' || eff === 'finished';
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1><FlaskConical size={24} /> Page de test</h1>
      </div>

      {/* Diagnostic API */}
      <div className="card settings-section">
        <h2 className="settings-title">Diagnostic API</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button className="btn-primary" onClick={diagnoseApi} disabled={loading}>Analyser API</button>
          <button className="btn-primary" onClick={forceUpdate} disabled={loading}>Forcer mise à jour</button>
          <button className="btn-secondary" onClick={checkLocal} disabled={loading}>Voir données locales</button>
          <button className="btn-danger" onClick={() => setLog([])}>Effacer</button>
        </div>
        <div style={{
          background: 'var(--bg)', borderRadius: 8, padding: '0.75rem',
          fontFamily: 'monospace', fontSize: '0.78rem', maxHeight: 360, overflowY: 'auto',
          border: '1px solid var(--border)',
        }}>
          {log.length === 0 ? (
            <span style={{ opacity: 0.5 }}>Cliquez sur "Analyser API" pour commencer le diagnostic.</span>
          ) : log.map((line, i) => {
            const color = line.startsWith('__green__') ? 'var(--green)' :
              line.startsWith('__red__') ? '#ef4444' : undefined;
            const text = line.replace(/^__(green|red)__/, '');
            return <div key={i} style={{ marginBottom: 3, color }}>{text}</div>;
          })}
        </div>
      </div>

      {/* Saisie manuelle */}
      <div className="card settings-section">
        <h2 className="settings-title">Saisie manuelle des scores</h2>
        <p className="settings-hint">Si l'API ne fonctionne pas, entrez les scores manuellement.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {pastMatches.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ flex: 1, fontSize: '0.85rem' }}>
                {m.homeTeam.name} vs {m.awayTeam.name}
                {m.homeScore !== undefined ? <strong> ({m.homeScore}-{m.awayScore})</strong> : ' (pas de score)'}
              </span>
              {editMatch?.id === m.id ? (
                <>
                  <input type="number" min="0" max="20" value={editHome}
                    onChange={e => setEditHome(e.target.value)} className="score-input" placeholder="0" />
                  <span>-</span>
                  <input type="number" min="0" max="20" value={editAway}
                    onChange={e => setEditAway(e.target.value)} className="score-input" placeholder="0" />
                  <button className="btn-primary" onClick={saveManual}>OK</button>
                  <button className="btn-secondary" onClick={() => setEditMatch(null)}>✕</button>
                </>
              ) : (
                <button className="btn-secondary" onClick={() => {
                  setEditMatch(m);
                  setEditHome(m.homeScore !== undefined ? String(m.homeScore) : '');
                  setEditAway(m.awayScore !== undefined ? String(m.awayScore) : '');
                }}>Modifier</button>
              )}
            </div>
          ))}
          {pastMatches.length === 0 && <p className="settings-hint">Aucun match en cours ou terminé pour le moment.</p>}
        </div>
      </div>
    </div>
  );
}
