import React, { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { db } from '../lib/storage';
import { Match } from '../types';
import { getEffectiveStatus } from '../lib/matchStatus';
import { fetchAndUpdateScores } from '../lib/liveScores';

const API_KEY = 'e17c642125d94af9bf0b31676463b862';

// Même mapping que liveScores.ts pour la traduction
const TEAM_NAME_MAP: Record<string, string> = {
  'United States': 'États-Unis', 'USA': 'États-Unis', 'Mexico': 'Mexique',
  'Canada': 'Canada', 'Argentina': 'Argentine', 'Chile': 'Chili', 'Peru': 'Pérou',
  'Australia': 'Australie', 'Brazil': 'Brésil', 'Colombia': 'Colombie', 'Uruguay': 'Uruguay',
  'Paraguay': 'Paraguay', 'France': 'France', 'England': 'Angleterre', 'Germany': 'Allemagne',
  'Portugal': 'Portugal', 'Spain': 'Espagne', 'Italy': 'Italie', 'Netherlands': 'Pays-Bas',
  'Holland': 'Pays-Bas', 'Croatia': 'Croatie', 'Morocco': 'Maroc', 'Senegal': 'Sénégal',
  'South Africa': 'Afrique du Sud', 'Cameroon': 'Cameroun', 'Japan': 'Japon',
  'South Korea': 'Corée du Sud', 'Korea Republic': 'Corée du Sud', 'Saudi Arabia': 'Arabie Saoudite',
  'Iran': 'Iran', 'Belgium': 'Belgique', 'Denmark': 'Danemark', 'Austria': 'Autriche',
  'Switzerland': 'Suisse', 'Ecuador': 'Équateur', 'Venezuela': 'Venezuela', 'Bolivia': 'Bolivie',
  'Costa Rica': 'Costa Rica', 'Egypt': 'Égypte', 'Nigeria': 'Nigéria', 'Algeria': 'Algérie',
  'Ivory Coast': "Côte d'Ivoire", "Côte d'Ivoire": "Côte d'Ivoire", 'Poland': 'Pologne',
  'Ukraine': 'Ukraine', 'Romania': 'Roumanie', 'Turkey': 'Türkiye', 'Türkiye': 'Türkiye',
  'New Zealand': 'Nouvelle-Zélande', 'Indonesia': 'Indonésie', 'Qatar': 'Qatar', 'Panama': 'Panama',
  'Czech Republic': 'Tchéquie', 'Czechia': 'Tchéquie', 'Bosnia and Herzegovina': 'Bosnie-Herzégovine',
  'Bosnia & Herzegovina': 'Bosnie-Herzégovine', 'Scotland': 'Écosse', 'Ghana': 'Ghana',
  'Tunisia': 'Tunisie', 'Curaçao': 'Curaçao', 'Cabo Verde': 'Cabo Verde', 'Cape Verde': 'Cabo Verde',
  'Iraq': 'Irak', 'Uzbekistan': 'Ouzbékistan', 'Jordan': 'Jordanie', 'Congo DR': 'Congo DR',
  'DR Congo': 'Congo DR', 'Norway': 'Norvège', 'Sweden': 'Suède', 'Haiti': 'Haïti',
};

function toFrench(name: string): string {
  return TEAM_NAME_MAP[name] || name;
}

function normalizeForComparison(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

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
    addLog('=== DIAGNOSTIC API football-data.org ===');
    const apiKey = localStorage.getItem('pf_football_api_key') || API_KEY;
    addLog(`Clé utilisée : ${apiKey.slice(0, 8)}...`);

    try {
      // Test 1: avec season=2026
      const r1 = await fetch('https://api.football-data.org/v4/competitions/WC/matches?season=2026', {
        headers: { 'X-Auth-Token': apiKey },
      });
      addLog(`HTTP avec season=2026 : ${r1.status} ${r1.statusText}`);
      if (r1.ok) {
        const d1 = await r1.json();
        const matches = d1.matches || [];
        const finished = matches.filter((m: any) => m.status === 'FINISHED');
        const live = matches.filter((m: any) => m.status === 'IN_PLAY' || m.status === 'PAUSED');
        addLog(`→ ${matches.length} matchs (${finished.length} terminés, ${live.length} en cours)`, 'green');

        // Show all finished with scores
        if (finished.length > 0) {
          addLog('--- Matchs terminés (noms API bruts) ---');
          finished.forEach((m: any) => {
            addLog(`  API: "${m.homeTeam.name}" ${m.score.fullTime.home ?? '?'}-${m.score.fullTime.away ?? '?'} "${m.awayTeam.name}"`);
          });
        }
        if (live.length > 0) {
          addLog('--- Matchs en cours ---');
          live.forEach((m: any) => {
            addLog(`  LIVE: "${m.homeTeam.name}" ${m.score.fullTime.home ?? '?'}-${m.score.fullTime.away ?? '?'} "${m.awayTeam.name}"`, 'green');
          });
        }

        // Check matching against local (avec traduction)
        const localMatches: Match[] = db.get<Match>('pf_matches');
        addLog('--- Correspondance API ↔ Local (avec traduction) ---');
        let matched = 0, unmatched = 0;
        finished.forEach((api: any) => {
          const frHome = toFrench(api.homeTeam.name);
          const frAway = toFrench(api.awayTeam.name);
          const normApiHome = normalizeForComparison(frHome);
          const normApiAway = normalizeForComparison(frAway);
          const found = localMatches.find(l =>
            normalizeForComparison(l.homeTeam.name) === normApiHome &&
            normalizeForComparison(l.awayTeam.name) === normApiAway
          );
          if (found) {
            matched++;
          } else {
            unmatched++;
            addLog(`  ❌ "${api.homeTeam.name}"→"${frHome}" / "${api.awayTeam.name}"→"${frAway}" non trouvé`, 'red');
          }
        });
        addLog(`Matchés : ${matched}/${finished.length} terminés`, matched === finished.length ? 'green' : 'red');
      } else {
        const text = await r1.text();
        addLog(`Erreur : ${text.slice(0, 200)}`, 'red');
      }
    } catch (e: any) {
      addLog(`Erreur réseau : ${e.message}`, 'red');
    } finally {
      setLoading(false);
    }
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
    const now = Date.now();
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
