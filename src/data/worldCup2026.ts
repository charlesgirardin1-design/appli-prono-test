import { Match } from '../types';

// 72 matchs de la phase de groupes — Coupe du Monde 2026
// Sources : FIFA.com, ESPN, CBS Sports, Yahoo Sports
// Heures en UTC | EDT = UTC-4 | CDT (Mexique) = UTC-5

export const WORLD_CUP_2026_MATCHES: Omit<Match, 'id'>[] = [

  // ══════════════════════════════════════════
  // GROUPE A — Mexique, Afrique du Sud, Corée du Sud, Tchéquie
  // ══════════════════════════════════════════

  // MD1
  { homeTeam: { name: 'Mexique' }, awayTeam: { name: 'Afrique du Sud' },
    date: '2026-06-11T20:00:00Z', competition: 'Groupe A',
    status: 'finished', homeScore: 2, awayScore: 0,
    odds: { home: 1.65, draw: 3.80, away: 5.00 } },

  { homeTeam: { name: 'Corée du Sud' }, awayTeam: { name: 'Tchéquie' },
    date: '2026-06-12T00:00:00Z', competition: 'Groupe A',
    status: 'finished', homeScore: 2, awayScore: 1,
    odds: { home: 2.20, draw: 3.20, away: 3.30 } },

  // MD2 — Tchéquie est à domicile à Atlanta
  { homeTeam: { name: 'Tchéquie' }, awayTeam: { name: 'Afrique du Sud' },
    date: '2026-06-18T16:00:00Z', competition: 'Groupe A',
    status: 'upcoming',
    odds: { home: 2.30, draw: 3.20, away: 3.10 } },

  { homeTeam: { name: 'Mexique' }, awayTeam: { name: 'Corée du Sud' },
    date: '2026-06-19T03:00:00Z', competition: 'Groupe A',
    status: 'upcoming',
    odds: { home: 1.90, draw: 3.40, away: 4.20 } },

  // MD3
  { homeTeam: { name: 'Tchéquie' }, awayTeam: { name: 'Mexique' },
    date: '2026-06-25T01:00:00Z', competition: 'Groupe A',
    status: 'upcoming',
    odds: { home: 4.80, draw: 3.60, away: 1.75 } },

  { homeTeam: { name: 'Afrique du Sud' }, awayTeam: { name: 'Corée du Sud' },
    date: '2026-06-25T01:00:00Z', competition: 'Groupe A',
    status: 'upcoming',
    odds: { home: 3.50, draw: 3.30, away: 2.10 } },

  // ══════════════════════════════════════════
  // GROUPE B — Canada, Bosnie-Herzégovine, Qatar, Suisse
  // ══════════════════════════════════════════

  // MD1
  { homeTeam: { name: 'Canada' }, awayTeam: { name: 'Bosnie-Herzégovine' },
    date: '2026-06-12T20:00:00Z', competition: 'Groupe B',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 2.00, draw: 3.30, away: 4.00 } },

  { homeTeam: { name: 'Suisse' }, awayTeam: { name: 'Qatar' },
    date: '2026-06-13T19:00:00Z', competition: 'Groupe B',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 1.60, draw: 3.80, away: 6.00 } },

  // MD2
  { homeTeam: { name: 'Suisse' }, awayTeam: { name: 'Bosnie-Herzégovine' },
    date: '2026-06-18T19:00:00Z', competition: 'Groupe B',
    status: 'upcoming',
    odds: { home: 1.55, draw: 4.00, away: 6.50 } },

  { homeTeam: { name: 'Canada' }, awayTeam: { name: 'Qatar' },
    date: '2026-06-18T22:00:00Z', competition: 'Groupe B',
    status: 'upcoming',
    odds: { home: 1.50, draw: 4.20, away: 7.00 } },

  // MD3
  { homeTeam: { name: 'Suisse' }, awayTeam: { name: 'Canada' },
    date: '2026-06-24T19:00:00Z', competition: 'Groupe B',
    status: 'upcoming',
    odds: { home: 2.10, draw: 3.30, away: 3.50 } },

  { homeTeam: { name: 'Bosnie-Herzégovine' }, awayTeam: { name: 'Qatar' },
    date: '2026-06-24T19:00:00Z', competition: 'Groupe B',
    status: 'upcoming',
    odds: { home: 1.80, draw: 3.50, away: 4.80 } },

  // ══════════════════════════════════════════
  // GROUPE C — Brésil, Maroc, Haïti, Écosse
  // ══════════════════════════════════════════

  // MD1
  { homeTeam: { name: 'Brésil' }, awayTeam: { name: 'Maroc' },
    date: '2026-06-13T22:00:00Z', competition: 'Groupe C',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 1.70, draw: 3.60, away: 5.50 } },

  { homeTeam: { name: 'Écosse' }, awayTeam: { name: 'Haïti' },
    date: '2026-06-14T00:00:00Z', competition: 'Groupe C',
    status: 'finished', homeScore: 1, awayScore: 0,
    odds: { home: 1.50, draw: 4.00, away: 8.00 } },

  // MD2
  { homeTeam: { name: 'Écosse' }, awayTeam: { name: 'Maroc' },
    date: '2026-06-19T22:00:00Z', competition: 'Groupe C',
    status: 'upcoming',
    odds: { home: 2.80, draw: 3.20, away: 2.60 } },

  { homeTeam: { name: 'Brésil' }, awayTeam: { name: 'Haïti' },
    date: '2026-06-20T01:00:00Z', competition: 'Groupe C',
    status: 'upcoming',
    odds: { home: 1.15, draw: 7.00, away: 18.00 } },

  // MD3
  { homeTeam: { name: 'Écosse' }, awayTeam: { name: 'Brésil' },
    date: '2026-06-24T22:00:00Z', competition: 'Groupe C',
    status: 'upcoming',
    odds: { home: 5.50, draw: 4.00, away: 1.60 } },

  { homeTeam: { name: 'Maroc' }, awayTeam: { name: 'Haïti' },
    date: '2026-06-24T22:00:00Z', competition: 'Groupe C',
    status: 'upcoming',
    odds: { home: 1.35, draw: 4.50, away: 9.00 } },

  // ══════════════════════════════════════════
  // GROUPE D — États-Unis, Paraguay, Australie, Türkiye
  // ══════════════════════════════════════════

  // MD1
  { homeTeam: { name: 'États-Unis' }, awayTeam: { name: 'Paraguay' },
    date: '2026-06-12T22:00:00Z', competition: 'Groupe D',
    status: 'finished', homeScore: 4, awayScore: 1,
    odds: { home: 1.70, draw: 3.60, away: 5.50 } },

  { homeTeam: { name: 'Australie' }, awayTeam: { name: 'Türkiye' },
    date: '2026-06-13T20:00:00Z', competition: 'Groupe D',
    status: 'finished', homeScore: 2, awayScore: 0,
    odds: { home: 2.30, draw: 3.30, away: 3.10 } },

  // MD2
  { homeTeam: { name: 'États-Unis' }, awayTeam: { name: 'Australie' },
    date: '2026-06-19T19:00:00Z', competition: 'Groupe D',
    status: 'upcoming',
    odds: { home: 1.80, draw: 3.50, away: 4.50 } },

  { homeTeam: { name: 'Türkiye' }, awayTeam: { name: 'Paraguay' },
    date: '2026-06-20T04:00:00Z', competition: 'Groupe D',
    status: 'upcoming',
    odds: { home: 1.90, draw: 3.40, away: 4.20 } },

  // MD3
  { homeTeam: { name: 'Türkiye' }, awayTeam: { name: 'États-Unis' },
    date: '2026-06-26T02:00:00Z', competition: 'Groupe D',
    status: 'upcoming',
    odds: { home: 3.20, draw: 3.30, away: 2.30 } },

  { homeTeam: { name: 'Paraguay' }, awayTeam: { name: 'Australie' },
    date: '2026-06-26T02:00:00Z', competition: 'Groupe D',
    status: 'upcoming',
    odds: { home: 2.40, draw: 3.30, away: 3.00 } },

  // ══════════════════════════════════════════
  // GROUPE E — Allemagne, Curaçao, Côte d'Ivoire, Équateur
  // ══════════════════════════════════════════

  // MD1
  { homeTeam: { name: 'Allemagne' }, awayTeam: { name: 'Curaçao' },
    date: '2026-06-14T22:00:00Z', competition: 'Groupe E',
    status: 'finished', homeScore: 7, awayScore: 1,
    odds: { home: 1.10, draw: 10.00, away: 28.00 } },

  { homeTeam: { name: "Côte d'Ivoire" }, awayTeam: { name: 'Équateur' },
    date: '2026-06-15T00:00:00Z', competition: 'Groupe E',
    status: 'finished', homeScore: 1, awayScore: 0,
    odds: { home: 2.20, draw: 3.20, away: 3.30 } },

  // MD2
  { homeTeam: { name: 'Allemagne' }, awayTeam: { name: "Côte d'Ivoire" },
    date: '2026-06-20T20:00:00Z', competition: 'Groupe E',
    status: 'upcoming',
    odds: { home: 1.40, draw: 4.50, away: 8.00 } },

  { homeTeam: { name: 'Équateur' }, awayTeam: { name: 'Curaçao' },
    date: '2026-06-21T00:00:00Z', competition: 'Groupe E',
    status: 'upcoming',
    odds: { home: 1.55, draw: 4.00, away: 6.50 } },

  // MD3
  { homeTeam: { name: 'Équateur' }, awayTeam: { name: 'Allemagne' },
    date: '2026-06-25T20:00:00Z', competition: 'Groupe E',
    status: 'upcoming',
    odds: { home: 7.00, draw: 5.00, away: 1.40 } },

  { homeTeam: { name: 'Curaçao' }, awayTeam: { name: "Côte d'Ivoire" },
    date: '2026-06-25T20:00:00Z', competition: 'Groupe E',
    status: 'upcoming',
    odds: { home: 5.50, draw: 4.20, away: 1.60 } },

  // ══════════════════════════════════════════
  // GROUPE F — Pays-Bas, Japon, Suède, Tunisie
  // ══════════════════════════════════════════

  // MD1
  { homeTeam: { name: 'Pays-Bas' }, awayTeam: { name: 'Japon' },
    date: '2026-06-14T19:00:00Z', competition: 'Groupe F',
    status: 'finished', homeScore: 2, awayScore: 2,
    odds: { home: 1.60, draw: 3.80, away: 6.50 } },

  { homeTeam: { name: 'Suède' }, awayTeam: { name: 'Tunisie' },
    date: '2026-06-14T23:00:00Z', competition: 'Groupe F',
    status: 'finished', homeScore: 5, awayScore: 1,
    odds: { home: 1.65, draw: 3.70, away: 6.00 } },

  // MD2 — Tunisie à domicile
  { homeTeam: { name: 'Pays-Bas' }, awayTeam: { name: 'Suède' },
    date: '2026-06-20T17:00:00Z', competition: 'Groupe F',
    status: 'upcoming',
    odds: { home: 1.75, draw: 3.50, away: 4.80 } },

  { homeTeam: { name: 'Tunisie' }, awayTeam: { name: 'Japon' },
    date: '2026-06-21T02:00:00Z', competition: 'Groupe F',
    status: 'upcoming',
    odds: { home: 3.20, draw: 3.20, away: 2.20 } },

  // MD3
  { homeTeam: { name: 'Japon' }, awayTeam: { name: 'Suède' },
    date: '2026-06-25T23:00:00Z', competition: 'Groupe F',
    status: 'upcoming',
    odds: { home: 2.50, draw: 3.20, away: 2.90 } },

  { homeTeam: { name: 'Tunisie' }, awayTeam: { name: 'Pays-Bas' },
    date: '2026-06-25T23:00:00Z', competition: 'Groupe F',
    status: 'upcoming',
    odds: { home: 6.50, draw: 4.50, away: 1.55 } },

  // ══════════════════════════════════════════
  // GROUPE G — Belgique, Égypte, Iran, Nouvelle-Zélande
  // ══════════════════════════════════════════

  // MD1
  { homeTeam: { name: 'Belgique' }, awayTeam: { name: 'Égypte' },
    date: '2026-06-15T19:00:00Z', competition: 'Groupe G',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 1.55, draw: 3.90, away: 6.50 } },

  { homeTeam: { name: 'Iran' }, awayTeam: { name: 'Nouvelle-Zélande' },
    date: '2026-06-16T01:00:00Z', competition: 'Groupe G',
    status: 'finished', homeScore: 2, awayScore: 2,
    odds: { home: 2.00, draw: 3.30, away: 4.00 } },

  // MD2 — Nouvelle-Zélande à domicile
  { homeTeam: { name: 'Belgique' }, awayTeam: { name: 'Iran' },
    date: '2026-06-21T19:00:00Z', competition: 'Groupe G',
    status: 'upcoming',
    odds: { home: 1.60, draw: 3.80, away: 6.00 } },

  { homeTeam: { name: 'Nouvelle-Zélande' }, awayTeam: { name: 'Égypte' },
    date: '2026-06-22T04:00:00Z', competition: 'Groupe G',
    status: 'upcoming',
    odds: { home: 3.00, draw: 3.20, away: 2.40 } },

  // MD3
  { homeTeam: { name: 'Égypte' }, awayTeam: { name: 'Iran' },
    date: '2026-06-26T23:00:00Z', competition: 'Groupe G',
    status: 'upcoming',
    odds: { home: 2.20, draw: 3.20, away: 3.30 } },

  { homeTeam: { name: 'Nouvelle-Zélande' }, awayTeam: { name: 'Belgique' },
    date: '2026-06-26T23:00:00Z', competition: 'Groupe G',
    status: 'upcoming',
    odds: { home: 6.00, draw: 4.50, away: 1.55 } },

  // ══════════════════════════════════════════
  // GROUPE H — Espagne, Cabo Verde, Arabie Saoudite, Uruguay
  // ══════════════════════════════════════════

  // MD1
  { homeTeam: { name: 'Espagne' }, awayTeam: { name: 'Cabo Verde' },
    date: '2026-06-15T16:00:00Z', competition: 'Groupe H',
    status: 'finished', homeScore: 0, awayScore: 0,
    odds: { home: 1.25, draw: 6.00, away: 13.00 } },

  { homeTeam: { name: 'Arabie Saoudite' }, awayTeam: { name: 'Uruguay' },
    date: '2026-06-15T22:00:00Z', competition: 'Groupe H',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 3.20, draw: 3.30, away: 2.30 } },

  // MD2
  { homeTeam: { name: 'Espagne' }, awayTeam: { name: 'Arabie Saoudite' },
    date: '2026-06-21T16:00:00Z', competition: 'Groupe H',
    status: 'upcoming',
    odds: { home: 1.30, draw: 5.50, away: 10.00 } },

  { homeTeam: { name: 'Uruguay' }, awayTeam: { name: 'Cabo Verde' },
    date: '2026-06-21T22:00:00Z', competition: 'Groupe H',
    status: 'upcoming',
    odds: { home: 1.55, draw: 4.00, away: 7.00 } },

  // MD3 — Uruguay et Cabo Verde à domicile
  { homeTeam: { name: 'Uruguay' }, awayTeam: { name: 'Espagne' },
    date: '2026-06-27T00:00:00Z', competition: 'Groupe H',
    status: 'upcoming',
    odds: { home: 3.80, draw: 3.40, away: 2.00 } },

  { homeTeam: { name: 'Cabo Verde' }, awayTeam: { name: 'Arabie Saoudite' },
    date: '2026-06-27T00:00:00Z', competition: 'Groupe H',
    status: 'upcoming',
    odds: { home: 3.20, draw: 3.30, away: 2.30 } },

  // ══════════════════════════════════════════
  // GROUPE I — France, Sénégal, Norvège, Irak
  // ══════════════════════════════════════════

  // MD1
  { homeTeam: { name: 'France' }, awayTeam: { name: 'Sénégal' },
    date: '2026-06-16T22:00:00Z', competition: 'Groupe I',
    status: 'finished', homeScore: 3, awayScore: 1,
    odds: { home: 1.45, draw: 4.20, away: 7.50 } },

  { homeTeam: { name: 'Norvège' }, awayTeam: { name: 'Irak' },
    date: '2026-06-17T00:00:00Z', competition: 'Groupe I',
    status: 'finished', homeScore: 4, awayScore: 1,
    odds: { home: 1.55, draw: 4.00, away: 7.00 } },

  // MD2
  { homeTeam: { name: 'France' }, awayTeam: { name: 'Irak' },
    date: '2026-06-22T21:00:00Z', competition: 'Groupe I',
    status: 'upcoming',
    odds: { home: 1.20, draw: 7.00, away: 16.00 } },

  { homeTeam: { name: 'Norvège' }, awayTeam: { name: 'Sénégal' },
    date: '2026-06-23T00:00:00Z', competition: 'Groupe I',
    status: 'upcoming',
    odds: { home: 1.90, draw: 3.40, away: 4.30 } },

  // MD3 — Norvège à domicile vs France
  { homeTeam: { name: 'Norvège' }, awayTeam: { name: 'France' },
    date: '2026-06-26T19:00:00Z', competition: 'Groupe I',
    status: 'upcoming',
    odds: { home: 3.20, draw: 3.30, away: 2.30 } },

  { homeTeam: { name: 'Sénégal' }, awayTeam: { name: 'Irak' },
    date: '2026-06-26T19:00:00Z', competition: 'Groupe I',
    status: 'upcoming',
    odds: { home: 1.55, draw: 3.90, away: 6.50 } },

  // ══════════════════════════════════════════
  // GROUPE J — Argentine, Algérie, Autriche, Jordanie
  // ══════════════════════════════════════════

  // MD1
  { homeTeam: { name: 'Argentine' }, awayTeam: { name: 'Algérie' },
    date: '2026-06-17T01:00:00Z', competition: 'Groupe J',
    status: 'finished', homeScore: 3, awayScore: 0,
    odds: { home: 1.40, draw: 4.50, away: 9.00 } },

  { homeTeam: { name: 'Autriche' }, awayTeam: { name: 'Jordanie' },
    date: '2026-06-17T22:00:00Z', competition: 'Groupe J',
    status: 'finished', homeScore: 3, awayScore: 1,
    odds: { home: 1.70, draw: 3.60, away: 5.50 } },

  // MD2
  { homeTeam: { name: 'Argentine' }, awayTeam: { name: 'Autriche' },
    date: '2026-06-22T17:00:00Z', competition: 'Groupe J',
    status: 'upcoming',
    odds: { home: 1.55, draw: 4.00, away: 6.50 } },

  { homeTeam: { name: 'Jordanie' }, awayTeam: { name: 'Algérie' },
    date: '2026-06-23T03:00:00Z', competition: 'Groupe J',
    status: 'upcoming',
    odds: { home: 2.50, draw: 3.20, away: 2.90 } },

  // MD3
  { homeTeam: { name: 'Algérie' }, awayTeam: { name: 'Autriche' },
    date: '2026-06-28T02:00:00Z', competition: 'Groupe J',
    status: 'upcoming',
    odds: { home: 2.80, draw: 3.20, away: 2.60 } },

  { homeTeam: { name: 'Jordanie' }, awayTeam: { name: 'Argentine' },
    date: '2026-06-28T02:00:00Z', competition: 'Groupe J',
    status: 'upcoming',
    odds: { home: 9.00, draw: 5.50, away: 1.35 } },

  // ══════════════════════════════════════════
  // GROUPE K — Portugal, Congo DR, Ouzbékistan, Colombie
  // ══════════════════════════════════════════

  // MD1
  { homeTeam: { name: 'Portugal' }, awayTeam: { name: 'Congo DR' },
    date: '2026-06-17T19:00:00Z', competition: 'Groupe K',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 1.35, draw: 4.80, away: 9.00 } },

  { homeTeam: { name: 'Colombie' }, awayTeam: { name: 'Ouzbékistan' },
    date: '2026-06-18T02:00:00Z', competition: 'Groupe K',
    status: 'finished', homeScore: 3, awayScore: 1,
    odds: { home: 1.60, draw: 3.80, away: 6.50 } },

  // MD2
  { homeTeam: { name: 'Portugal' }, awayTeam: { name: 'Ouzbékistan' },
    date: '2026-06-23T17:00:00Z', competition: 'Groupe K',
    status: 'upcoming',
    odds: { home: 1.25, draw: 6.00, away: 13.00 } },

  { homeTeam: { name: 'Colombie' }, awayTeam: { name: 'Congo DR' },
    date: '2026-06-24T02:00:00Z', competition: 'Groupe K',
    status: 'upcoming',
    odds: { home: 1.70, draw: 3.60, away: 5.50 } },

  // MD3
  { homeTeam: { name: 'Colombie' }, awayTeam: { name: 'Portugal' },
    date: '2026-06-27T23:30:00Z', competition: 'Groupe K',
    status: 'upcoming',
    odds: { home: 3.00, draw: 3.30, away: 2.40 } },

  { homeTeam: { name: 'Congo DR' }, awayTeam: { name: 'Ouzbékistan' },
    date: '2026-06-27T23:30:00Z', competition: 'Groupe K',
    status: 'upcoming',
    odds: { home: 1.80, draw: 3.50, away: 4.80 } },

  // ══════════════════════════════════════════
  // GROUPE L — Angleterre, Croatie, Ghana, Panama
  // ══════════════════════════════════════════

  // MD1
  { homeTeam: { name: 'Angleterre' }, awayTeam: { name: 'Croatie' },
    date: '2026-06-17T22:00:00Z', competition: 'Groupe L',
    status: 'finished', homeScore: 4, awayScore: 2,
    odds: { home: 1.55, draw: 4.00, away: 6.50 } },

  { homeTeam: { name: 'Ghana' }, awayTeam: { name: 'Panama' },
    date: '2026-06-18T03:00:00Z', competition: 'Groupe L',
    status: 'finished', homeScore: 1, awayScore: 0,
    odds: { home: 1.90, draw: 3.40, away: 4.30 } },

  // MD2
  { homeTeam: { name: 'Angleterre' }, awayTeam: { name: 'Ghana' },
    date: '2026-06-23T20:00:00Z', competition: 'Groupe L',
    status: 'upcoming',
    odds: { home: 1.50, draw: 4.20, away: 7.50 } },

  { homeTeam: { name: 'Panama' }, awayTeam: { name: 'Croatie' },
    date: '2026-06-23T23:00:00Z', competition: 'Groupe L',
    status: 'upcoming',
    odds: { home: 3.50, draw: 3.40, away: 2.10 } },

  // MD3
  { homeTeam: { name: 'Panama' }, awayTeam: { name: 'Angleterre' },
    date: '2026-06-27T21:00:00Z', competition: 'Groupe L',
    status: 'upcoming',
    odds: { home: 10.00, draw: 6.00, away: 1.30 } },

  { homeTeam: { name: 'Croatie' }, awayTeam: { name: 'Ghana' },
    date: '2026-06-27T21:00:00Z', competition: 'Groupe L',
    status: 'upcoming',
    odds: { home: 2.20, draw: 3.20, away: 3.30 } },
];
