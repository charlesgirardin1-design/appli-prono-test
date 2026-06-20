import React, { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { fetchAndUpdateScores } from '../lib/liveScores';
import { db } from '../lib/storage';
import { Match } from '../types';

export default function TestPage() {
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function addLog(msg: string) {
    setLog(prev => [`[${new Date().toLocaleTimeString('fr-FR')}] ${msg}`, ...prev]);
  }

  async function testApi() {
    setLoading(true);
    const apiKey = localStorage.getItem('pf_football_api_key') || 'e17c642125d94af9bf0b31676463b862';
    addLog(`Test API avec clé : ${apiKey.slice(0, 8)}...`);
    try {
      const resp = await fetch('https://api.football-data.org/v4/competitions/WC/matches?season=2026', {
        headers: { 'X-Auth-Token': apiKey },
      });
      addLog(`Statut HTTP : ${resp.status} ${resp.statusText}`);
      if (resp.ok) {
        const data = await resp.json();
        const matches = data.matches || [];
        const finished = matches.filter((m: any) => m.status === 'FINISHED');
        const live = matches.filter((m: any) => m.status === 'IN_PLAY' || m.status === 'PAUSED');
        addLog(`Total matchs API : ${matches.length}`);
        addLog(`Terminés : ${finished.length}, En cours : ${live.length}`);
        if (finished.length > 0) {
          finished.slice(0, 3).forEach((m: any) => {
            addLog(`  ${m.homeTeam.name} ${m.score.fullTime.home ?? '?'} - ${m.score.fullTime.away ?? '?'} ${m.awayTeam.name}`);
          });
        }
      }
    } catch (e: any) {
      addLog(`Erreur réseau : ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function forceUpdateScores() {
    setLoading(true);
    addLog('Mise à jour forcée des scores...');
    const apiKey = localStorage.getItem('pf_football_api_key') || 'e17c642125d94af9bf0b31676463b862';
    try {
      await fetchAndUpdateScores(apiKey);
      addLog('Scores mis à jour (voir console pour détails)');
      const matches: Match[] = db.get<Match>('pf_matches');
      const finished = matches.filter(m => m.status === 'finished');
      const withScore = finished.filter(m => m.homeScore !== undefined);
      addLog(`Matchs terminés en local : ${finished.length}, avec score : ${withScore.length}`);
      withScore.slice(0, 5).forEach(m => {
        addLog(`  ${m.homeTeam.name} ${m.homeScore} - ${m.awayScore} ${m.awayTeam.name}`);
      });
    } catch (e: any) {
      addLog(`Erreur : ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function checkLocalMatches() {
    const matches: Match[] = db.get<Match>('pf_matches');
    addLog(`Total matchs en local : ${matches.length}`);
    const byStatus = { upcoming: 0, live: 0, finished: 0 };
    matches.forEach(m => { byStatus[m.status as keyof typeof byStatus]++; });
    addLog(`À venir : ${byStatus.upcoming}, En cours : ${byStatus.live}, Terminés : ${byStatus.finished}`);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><FlaskConical size={24} /> Page de test</h1>
      </div>

      <div className="card settings-section">
        <h2 className="settings-title">Diagnostics</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button className="btn-primary" onClick={testApi} disabled={loading}>
            Tester API football-data.org
          </button>
          <button className="btn-primary" onClick={forceUpdateScores} disabled={loading}>
            Forcer mise à jour scores
          </button>
          <button className="btn-secondary" onClick={checkLocalMatches} disabled={loading}>
            Vérifier données locales
          </button>
          <button className="btn-danger" onClick={() => setLog([])}>
            Effacer log
          </button>
        </div>

        <div style={{
          background: 'var(--bg)',
          borderRadius: 8,
          padding: '0.75rem',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          maxHeight: 400,
          overflowY: 'auto',
          border: '1px solid var(--border)',
        }}>
          {log.length === 0 ? (
            <span style={{ opacity: 0.5 }}>Aucun log. Cliquez sur un bouton pour commencer.</span>
          ) : (
            log.map((line, i) => <div key={i} style={{ marginBottom: 4 }}>{line}</div>)
          )}
        </div>
      </div>
    </div>
  );
}
