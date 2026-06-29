import { Match } from '../types';

export const WORLD_CUP_2026_MATCHES: Omit<Match, 'id'>[] = [

  // ââââââââââââââââââââââââââââââââââââââââââ
  // GROUPE A â Mexique, Afrique du Sud, CorÃ©e du Sud, TchÃ©quie
  // ââââââââââââââââââââââââââââââââââââââââââ
  { homeTeam: { name: 'Mexique' }, awayTeam: { name: 'Afrique du Sud' },
    date: '2026-06-11T20:00:00Z', competition: 'Groupe A', phase: 'Phase de groupes',
    status: 'finished', homeScore: 2, awayScore: 0,
    odds: { home: 1.65, draw: 3.80, away: 5.00 } },

  { homeTeam: { name: 'CorÃ©e du Sud' }, awayTeam: { name: 'TchÃ©quie' },
    date: '2026-06-12T00:00:00Z', competition: 'Groupe A', phase: 'Phase de groupes',
    status: 'finished', homeScore: 2, awayScore: 1,
    odds: { home: 2.20, draw: 3.20, away: 3.30 } },

  { homeTeam: { name: 'TchÃ©quie' }, awayTeam: { name: 'Afrique du Sud' },
    date: '2026-06-18T16:00:00Z', competition: 'Groupe A', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 2.30, draw: 3.20, away: 3.10 } },

  { homeTeam: { name: 'Mexique' }, awayTeam: { name: 'CorÃ©e du Sud' },
    date: '2026-06-19T03:00:00Z', competition: 'Groupe A', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 0,
    odds: { home: 1.90, draw: 3.40, away: 4.20 } },

  { homeTeam: { name: 'TchÃ©quie' }, awayTeam: { name: 'Mexique' },
    date: '2026-06-25T01:00:00Z', competition: 'Groupe A', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 3,
    odds: { home: 4.80, draw: 3.60, away: 1.75 } },

  { homeTeam: { name: 'Afrique du Sud' }, awayTeam: { name: 'CorÃ©e du Sud' },
    date: '2026-06-25T01:00:00Z', competition: 'Groupe A', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 0,
    odds: { home: 3.50, draw: 3.30, away: 2.10 } },

  // ââââââââââââââââââââââââââââââââââââââââââ
  // GROUPE B â Canada, Bosnie-HerzÃ©govine, Qatar, Suisse
  // ââââââââââââââââââââââââââââââââââââââââââ
  { homeTeam: { name: 'Canada' }, awayTeam: { name: 'Bosnie-HerzÃ©govine' },
    date: '2026-06-12T20:00:00Z', competition: 'Groupe B', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 2.00, draw: 3.30, away: 4.00 } },

  { homeTeam: { name: 'Suisse' }, awayTeam: { name: 'Qatar' },
    date: '2026-06-13T19:00:00Z', competition: 'Groupe B', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 1.60, draw: 3.80, away: 6.00 } },

  { homeTeam: { name: 'Suisse' }, awayTeam: { name: 'Bosnie-HerzÃ©govine' },
    date: '2026-06-18T19:00:00Z', competition: 'Groupe B', phase: 'Phase de groupes',
    status: 'finished', homeScore: 4, awayScore: 1,
    odds: { home: 1.55, draw: 4.00, away: 6.50 } },

  { homeTeam: { name: 'Canada' }, awayTeam: { name: 'Qatar' },
    date: '2026-06-18T22:00:00Z', competition: 'Groupe B', phase: 'Phase de groupes',
    status: 'finished', homeScore: 6, awayScore: 0,
    odds: { home: 1.50, draw: 4.20, away: 7.00 } },

  { homeTeam: { name: 'Suisse' }, awayTeam: { name: 'Canada' },
    date: '2026-06-24T19:00:00Z', competition: 'Groupe B', phase: 'Phase de groupes',
    status: 'finished', homeScore: 2, awayScore: 1,
    odds: { home: 2.10, draw: 3.30, away: 3.50 } },

  { homeTeam: { name: 'Bosnie-HerzÃ©govine' }, awayTeam: { name: 'Qatar' },
    date: '2026-06-24T19:00:00Z', competition: 'Groupe B', phase: 'Phase de groupes',
    status: 'finished', homeScore: 3, awayScore: 1,
    odds: { home: 1.80, draw: 3.50, away: 4.80 } },

  // ââââââââââââââââââââââââââââââââââââââââââ
  // GROUPE C â BrÃ©sil, Maroc, HaÃ¯ti, Ãcosse
  // ââââââââââââââââââââââââââââââââââââââââââ
  { homeTeam: { name: 'BrÃ©sil' }, awayTeam: { name: 'Maroc' },
    date: '2026-06-13T22:00:00Z', competition: 'Groupe C', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 1.70, draw: 3.60, away: 5.50 } },

  { homeTeam: { name: 'Ãcosse' }, awayTeam: { name: 'HaÃ¯ti' },
    date: '2026-06-14T00:00:00Z', competition: 'Groupe C', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 0,
    odds: { home: 1.50, draw: 4.00, away: 8.00 } },

  { homeTeam: { name: 'Ãcosse' }, awayTeam: { name: 'Maroc' },
    date: '2026-06-19T22:00:00Z', competition: 'Groupe C', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 1,
    odds: { home: 2.80, draw: 3.20, away: 2.60 } },

  { homeTeam: { name: 'BrÃ©sil' }, awayTeam: { name: 'HaÃ¯ti' },
    date: '2026-06-20T01:00:00Z', competition: 'Groupe C', phase: 'Phase de groupes',
    status: 'finished', homeScore: 3, awayScore: 0,
    odds: { home: 1.15, draw: 7.00, away: 18.00 } },

  { homeTeam: { name: 'Ãcosse' }, awayTeam: { name: 'BrÃ©sil' },
    date: '2026-06-24T22:00:00Z', competition: 'Groupe C', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 3,
    odds: { home: 5.50, draw: 4.00, away: 1.60 } },

  { homeTeam: { name: 'Maroc' }, awayTeam: { name: 'HaÃ¯ti' },
    date: '2026-06-24T22:00:00Z', competition: 'Groupe C', phase: 'Phase de groupes',
    status: 'finished', homeScore: 4, awayScore: 2,
    odds: { home: 1.35, draw: 4.50, away: 9.00 } },

  // ââââââââââââââââââââââââââââââââââââââââââ
  // GROUPE D â Ãtats-Unis, Paraguay, Australie, TÃ¼rkiye
  // ââââââââââââââââââââââââââââââââââââââââââ
  { homeTeam: { name: 'Ãtats-Unis' }, awayTeam: { name: 'Paraguay' },
    date: '2026-06-12T22:00:00Z', competition: 'Groupe D', phase: 'Phase de groupes',
    status: 'finished', homeScore: 4, awayScore: 1,
    odds: { home: 1.70, draw: 3.60, away: 5.50 } },

  { homeTeam: { name: 'Australie' }, awayTeam: { name: 'TÃ¼rkiye' },
    date: '2026-06-13T20:00:00Z', competition: 'Groupe D', phase: 'Phase de groupes',
    status: 'finished', homeScore: 2, awayScore: 0,
    odds: { home: 2.30, draw: 3.30, away: 3.10 } },

  { homeTeam: { name: 'Ãtats-Unis' }, awayTeam: { name: 'Australie' },
    date: '2026-06-19T19:00:00Z', competition: 'Groupe D', phase: 'Phase de groupes',
    status: 'finished', homeScore: 2, awayScore: 0,
    odds: { home: 1.80, draw: 3.50, away: 4.50 } },

  { homeTeam: { name: 'TÃ¼rkiye' }, awayTeam: { name: 'Paraguay' },
    date: '2026-06-20T04:00:00Z', competition: 'Groupe D', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 1,
    odds: { home: 1.90, draw: 3.40, away: 4.20 } },

  { homeTeam: { name: 'TÃ¼rkiye' }, awayTeam: { name: 'Ãtats-Unis' },
    date: '2026-06-26T02:00:00Z', competition: 'Groupe D', phase: 'Phase de groupes',
    status: 'finished', homeScore: 3, awayScore: 2,
    odds: { home: 3.20, draw: 3.30, away: 2.30 } },

  { homeTeam: { name: 'Paraguay' }, awayTeam: { name: 'Australie' },
    date: '2026-06-26T02:00:00Z', competition: 'Groupe D', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 0,
    odds: { home: 2.40, draw: 3.30, away: 3.00 } },

  // ââââââââââââââââââââââââââââââââââââââââââ
  // GROUPE E â Allemagne, CuraÃ§ao, CÃ´te d'Ivoire, Ãquateur
  // ââââââââââââââââââââââââââââââââââââââââââ
  { homeTeam: { name: 'Allemagne' }, awayTeam: { name: 'CuraÃ§ao' },
    date: '2026-06-14T22:00:00Z', competition: 'Groupe E', phase: 'Phase de groupes',
    status: 'finished', homeScore: 7, awayScore: 1,
    odds: { home: 1.10, draw: 10.00, away: 28.00 } },

  { homeTeam: { name: "CÃ´te d'Ivoire" }, awayTeam: { name: 'Ãquateur' },
    date: '2026-06-15T00:00:00Z', competition: 'Groupe E', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 0,
    odds: { home: 2.20, draw: 3.20, away: 3.30 } },

  { homeTeam: { name: 'Allemagne' }, awayTeam: { name: "CÃ´te d'Ivoire" },
    date: '2026-06-20T20:00:00Z', competition: 'Groupe E', phase: 'Phase de groupes',
    status: 'finished', homeScore: 2, awayScore: 1,
    odds: { home: 1.40, draw: 4.50, away: 8.00 } },

  { homeTeam: { name: 'Ãquateur' }, awayTeam: { name: 'CuraÃ§ao' },
    date: '2026-06-21T00:00:00Z', competition: 'Groupe E', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 0,
    odds: { home: 1.55, draw: 4.00, away: 6.50 } },

  { homeTeam: { name: 'Ãquateur' }, awayTeam: { name: 'Allemagne' },
    date: '2026-06-25T20:00:00Z', competition: 'Groupe E', phase: 'Phase de groupes',
    status: 'finished', homeScore: 2, awayScore: 1,
    odds: { home: 7.00, draw: 5.00, away: 1.40 } },

  { homeTeam: { name: 'CuraÃ§ao' }, awayTeam: { name: "CÃ´te d'Ivoire" },
    date: '2026-06-25T20:00:00Z', competition: 'Groupe E', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 2,
    odds: { home: 5.50, draw: 4.20, away: 1.60 } },

  // ââââââââââââââââââââââââââââââââââââââââââ
  // GROUPE F â Pays-Bas, Japon, SuÃ¨de, Tunisie
  // ââââââââââââââââââââââââââââââââââââââââââ
  { homeTeam: { name: 'Pays-Bas' }, awayTeam: { name: 'Japon' },
    date: '2026-06-14T19:00:00Z', competition: 'Groupe F', phase: 'Phase de groupes',
    status: 'finished', homeScore: 2, awayScore: 2,
    odds: { home: 1.60, draw: 3.80, away: 6.50 } },

  { homeTeam: { name: 'SuÃ¨de' }, awayTeam: { name: 'Tunisie' },
    date: '2026-06-14T23:00:00Z', competition: 'Groupe F', phase: 'Phase de groupes',
    status: 'finished', homeScore: 5, awayScore: 1,
    odds: { home: 1.65, draw: 3.70, away: 6.00 } },

  { homeTeam: { name: 'Pays-Bas' }, awayTeam: { name: 'SuÃ¨de' },
    date: '2026-06-20T17:00:00Z', competition: 'Groupe F', phase: 'Phase de groupes',
    status: 'finished', homeScore: 5, awayScore: 1,
    odds: { home: 1.75, draw: 3.50, away: 4.80 } },

  { homeTeam: { name: 'Tunisie' }, awayTeam: { name: 'Japon' },
    date: '2026-06-21T02:00:00Z', competition: 'Groupe F', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 4,
    odds: { home: 3.20, draw: 3.20, away: 2.20 } },

  { homeTeam: { name: 'Japon' }, awayTeam: { name: 'SuÃ¨de' },
    date: '2026-06-25T23:00:00Z', competition: 'Groupe F', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 2.50, draw: 3.20, away: 2.90 } },

  { homeTeam: { name: 'Tunisie' }, awayTeam: { name: 'Pays-Bas' },
    date: '2026-06-25T23:00:00Z', competition: 'Groupe F', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 3,
    odds: { home: 6.50, draw: 4.50, away: 1.55 } },

  // ââââââââââââââââââââââââââââââââââââââââââ
  // GROUPE G â Belgique, Ãgypte, Iran, Nouvelle-ZÃ©lande
  // ââââââââââââââââââââââââââââââââââââââââââ
  { homeTeam: { name: 'Belgique' }, awayTeam: { name: 'Ãgypte' },
    date: '2026-06-15T19:00:00Z', competition: 'Groupe G', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 1.55, draw: 3.90, away: 6.50 } },

  { homeTeam: { name: 'Iran' }, awayTeam: { name: 'Nouvelle-ZÃ©lande' },
    date: '2026-06-16T01:00:00Z', competition: 'Groupe G', phase: 'Phase de groupes',
    status: 'finished', homeScore: 2, awayScore: 2,
    odds: { home: 2.00, draw: 3.30, away: 4.00 } },

  { homeTeam: { name: 'Belgique' }, awayTeam: { name: 'Iran' },
    date: '2026-06-21T19:00:00Z', competition: 'Groupe G', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 0,
    odds: { home: 1.60, draw: 3.80, away: 6.00 } },

  { homeTeam: { name: 'Nouvelle-ZÃ©lande' }, awayTeam: { name: 'Ãgypte' },
    date: '2026-06-22T04:00:00Z', competition: 'Groupe G', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 3,
    odds: { home: 3.00, draw: 3.20, away: 2.40 } },

  { homeTeam: { name: 'Ãgypte' }, awayTeam: { name: 'Iran' },
    date: '2026-06-26T23:00:00Z', competition: 'Groupe G', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 2.20, draw: 3.20, away: 3.30 } },

  { homeTeam: { name: 'Nouvelle-ZÃ©lande' }, awayTeam: { name: 'Belgique' },
    date: '2026-06-26T23:00:00Z', competition: 'Groupe G', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 5,
    odds: { home: 6.00, draw: 4.50, away: 1.55 } },

  // ââââââââââââââââââââââââââââââââââââââââââ
  // GROUPE H â Espagne, Cabo Verde, Arabie Saoudite, Uruguay
  // ââââââââââââââââââââââââââââââââââââââââââ
  { homeTeam: { name: 'Espagne' }, awayTeam: { name: 'Cabo Verde' },
    date: '2026-06-15T16:00:00Z', competition: 'Groupe H', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 0,
    odds: { home: 1.25, draw: 6.00, away: 13.00 } },

  { homeTeam: { name: 'Arabie Saoudite' }, awayTeam: { name: 'Uruguay' },
    date: '2026-06-15T22:00:00Z', competition: 'Groupe H', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 3.20, draw: 3.30, away: 2.30 } },

  { homeTeam: { name: 'Espagne' }, awayTeam: { name: 'Arabie Saoudite' },
    date: '2026-06-21T16:00:00Z', competition: 'Groupe H', phase: 'Phase de groupes',
    status: 'finished', homeScore: 4, awayScore: 0,
    odds: { home: 1.30, draw: 5.50, away: 10.00 } },

  { homeTeam: { name: 'Uruguay' }, awayTeam: { name: 'Cabo Verde' },
    date: '2026-06-21T22:00:00Z', competition: 'Groupe H', phase: 'Phase de groupes',
    status: 'finished', homeScore: 2, awayScore: 2,
    odds: { home: 1.55, draw: 4.00, away: 7.00 } },

  { homeTeam: { name: 'Uruguay' }, awayTeam: { name: 'Espagne' },
    date: '2026-06-27T00:00:00Z', competition: 'Groupe H', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 1,
    odds: { home: 3.80, draw: 3.40, away: 2.00 } },

  { homeTeam: { name: 'Cabo Verde' }, awayTeam: { name: 'Arabie Saoudite' },
    date: '2026-06-27T00:00:00Z', competition: 'Groupe H', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 0,
    odds: { home: 3.20, draw: 3.30, away: 2.30 } },

  // ââââââââââââââââââââââââââââââââââââââââââ
  // GROUPE I â France, SÃ©nÃ©gal, NorvÃ¨ge, Irak
  // ââââââââââââââââââââââââââââââââââââââââââ
  { homeTeam: { name: 'France' }, awayTeam: { name: 'SÃ©nÃ©gal' },
    date: '2026-06-16T22:00:00Z', competition: 'Groupe I', phase: 'Phase de groupes',
    status: 'finished', homeScore: 3, awayScore: 1,
    odds: { home: 1.45, draw: 4.20, away: 7.50 } },

  { homeTeam: { name: 'NorvÃ¨ge' }, awayTeam: { name: 'Irak' },
    date: '2026-06-17T00:00:00Z', competition: 'Groupe I', phase: 'Phase de groupes',
    status: 'finished', homeScore: 4, awayScore: 1,
    odds: { home: 1.55, draw: 4.00, away: 7.00 } },

  { homeTeam: { name: 'France' }, awayTeam: { name: 'Irak' },
    date: '2026-06-22T21:00:00Z', competition: 'Groupe I', phase: 'Phase de groupes',
    status: 'finished', homeScore: 3, awayScore: 0,
    odds: { home: 1.20, draw: 7.00, away: 16.00 } },

  { homeTeam: { name: 'NorvÃ¨ge' }, awayTeam: { name: 'SÃ©nÃ©gal' },
    date: '2026-06-23T00:00:00Z', competition: 'Groupe I', phase: 'Phase de groupes',
    status: 'finished', homeScore: 3, awayScore: 2,
    odds: { home: 1.90, draw: 3.40, away: 4.30 } },

  { homeTeam: { name: 'NorvÃ¨ge' }, awayTeam: { name: 'France' },
    date: '2026-06-26T19:00:00Z', competition: 'Groupe I', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 4,
    odds: { home: 3.20, draw: 3.30, away: 2.30 } },

  { homeTeam: { name: 'SÃ©nÃ©gal' }, awayTeam: { name: 'Irak' },
    date: '2026-06-26T19:00:00Z', competition: 'Groupe I', phase: 'Phase de groupes',
    status: 'finished', homeScore: 5, awayScore: 0,
    odds: { home: 1.55, draw: 3.90, away: 6.50 } },

  // ââââââââââââââââââââââââââââââââââââââââââ
  // GROUPE J â Argentine, AlgÃ©rie, Autriche, Jordanie
  // ââââââââââââââââââââââââââââââââââââââââââ
  { homeTeam: { name: 'Argentine' }, awayTeam: { name: 'AlgÃ©rie' },
    date: '2026-06-17T01:00:00Z', competition: 'Groupe J', phase: 'Phase de groupes',
    status: 'finished', homeScore: 3, awayScore: 0,
    odds: { home: 1.40, draw: 4.50, away: 9.00 } },

  { homeTeam: { name: 'Autriche' }, awayTeam: { name: 'Jordanie' },
    date: '2026-06-17T22:00:00Z', competition: 'Groupe J', phase: 'Phase de groupes',
    status: 'finished', homeScore: 3, awayScore: 1,
    odds: { home: 1.70, draw: 3.60, away: 5.50 } },

  { homeTeam: { name: 'Argentine' }, awayTeam: { name: 'Autriche' },
    date: '2026-06-22T17:00:00Z', competition: 'Groupe J', phase: 'Phase de groupes',
    status: 'finished', homeScore: 2, awayScore: 0,
    odds: { home: 1.55, draw: 4.00, away: 6.50 } },

  { homeTeam: { name: 'Jordanie' }, awayTeam: { name: 'AlgÃ©rie' },
    date: '2026-06-23T03:00:00Z', competition: 'Groupe J', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 2,
    odds: { home: 2.50, draw: 3.20, away: 2.90 } },

  { homeTeam: { name: 'AlgÃ©rie' }, awayTeam: { name: 'Autriche' },
    date: '2026-06-28T02:00:00Z', competition: 'Groupe J', phase: 'Phase de groupes',
    status: 'finished', homeScore: 3, awayScore: 3,
    odds: { home: 2.80, draw: 3.20, away: 2.60 } },

  { homeTeam: { name: 'Jordanie' }, awayTeam: { name: 'Argentine' },
    date: '2026-06-28T02:00:00Z', competition: 'Groupe J', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 3,
    odds: { home: 9.00, draw: 5.50, away: 1.35 } },

  // ââââââââââââââââââââââââââââââââââââââââââ
  // GROUPE K â Portugal, Congo DR, OuzbÃ©kistan, Colombie
  // ââââââââââââââââââââââââââââââââââââââââââ
  { homeTeam: { name: 'Portugal' }, awayTeam: { name: 'Congo DR' },
    date: '2026-06-17T19:00:00Z', competition: 'Groupe K', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 1,
    odds: { home: 1.35, draw: 4.80, away: 9.00 } },

  { homeTeam: { name: 'Colombie' }, awayTeam: { name: 'OuzbÃ©kistan' },
    date: '2026-06-18T02:00:00Z', competition: 'Groupe K', phase: 'Phase de groupes',
    status: 'finished', homeScore: 3, awayScore: 1,
    odds: { home: 1.60, draw: 3.80, away: 6.50 } },

  { homeTeam: { name: 'Portugal' }, awayTeam: { name: 'OuzbÃ©kistan' },
    date: '2026-06-23T17:00:00Z', competition: 'Groupe K', phase: 'Phase de groupes',
    status: 'finished', homeScore: 5, awayScore: 0,
    odds: { home: 1.25, draw: 6.00, away: 13.00 } },

  { homeTeam: { name: 'Colombie' }, awayTeam: { name: 'Congo DR' },
    date: '2026-06-24T02:00:00Z', competition: 'Groupe K', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 0,
    odds: { home: 1.70, draw: 3.60, away: 5.50 } },

  { homeTeam: { name: 'Colombie' }, awayTeam: { name: 'Portugal' },
    date: '2026-06-27T23:30:00Z', competition: 'Groupe K', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 0,
    odds: { home: 3.00, draw: 3.30, away: 2.40 } },

  { homeTeam: { name: 'Congo DR' }, awayTeam: { name: 'OuzbÃ©kistan' },
    date: '2026-06-27T23:30:00Z', competition: 'Groupe K', phase: 'Phase de groupes',
    status: 'finished', homeScore: 3, awayScore: 1,
    odds: { home: 1.80, draw: 3.50, away: 4.80 } },

  // ââââââââââââââââââââââââââââââââââââââââââ
  // GROUPE L â Angleterre, Croatie, Ghana, Panama
  // ââââââââââââââââââââââââââââââââââââââââââ
  { homeTeam: { name: 'Angleterre' }, awayTeam: { name: 'Croatie' },
    date: '2026-06-17T22:00:00Z', competition: 'Groupe L', phase: 'Phase de groupes',
    status: 'finished', homeScore: 4, awayScore: 2,
    odds: { home: 1.55, draw: 4.00, away: 6.50 } },

  { homeTeam: { name: 'Ghana' }, awayTeam: { name: 'Panama' },
    date: '2026-06-18T03:00:00Z', competition: 'Groupe L', phase: 'Phase de groupes',
    status: 'finished', homeScore: 1, awayScore: 0,
    odds: { home: 1.90, draw: 3.40, away: 4.30 } },

  { homeTeam: { name: 'Angleterre' }, awayTeam: { name: 'Ghana' },
    date: '2026-06-23T20:00:00Z', competition: 'Groupe L', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 0,
    odds: { home: 1.50, draw: 4.20, away: 7.50 } },

  { homeTeam: { name: 'Panama' }, awayTeam: { name: 'Croatie' },
    date: '2026-06-23T23:00:00Z', competition: 'Groupe L', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 1,
    odds: { home: 3.50, draw: 3.40, away: 2.10 } },

  { homeTeam: { name: 'Panama' }, awayTeam: { name: 'Angleterre' },
    date: '2026-06-27T21:00:00Z', competition: 'Groupe L', phase: 'Phase de groupes',
    status: 'finished', homeScore: 0, awayScore: 2,
    odds: { home: 10.00, draw: 6.00, away: 1.30 } },

  { homeTeam: { name: 'Croatie' }, awayTeam: { name: 'Ghana' },
    date: '2026-06-27T21:00:00Z', competition: 'Groupe L', phase: 'Phase de groupes',
    status: 'finished', homeScore: 2, awayScore: 1,
    odds: { home: 2.20, draw: 3.20, away: 3.30 } },

  // ââââââââââââââââââââââââââââââââââââââââââ
  // HUITIÃMES DE FINALE (Round of 32)
  // ââââââââââââââââââââââââââââââââââââââââââ
  { homeTeam: { name: 'Afrique du Sud' }, awayTeam: { name: 'Canada' },
    date: '2026-06-28T19:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'finished', homeScore: 0, awayScore: 1,
    odds: { home: 3.50, draw: 3.20, away: 2.10 } },

  { homeTeam: { name: 'BrÃ©sil' }, awayTeam: { name: 'Japon' },
    date: '2026-06-29T17:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 1.45, draw: 4.50, away: 7.50 } },

  { homeTeam: { name: 'Allemagne' }, awayTeam: { name: 'Paraguay' },
    date: '2026-06-29T20:30:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 1.35, draw: 5.00, away: 9.00 } },

  { homeTeam: { name: 'Pays-Bas' }, awayTeam: { name: 'Maroc' },
    date: '2026-06-30T01:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 1.60, draw: 3.80, away: 6.00 } },

  { homeTeam: { name: "CÃ´te d'Ivoire" }, awayTeam: { name: 'NorvÃ¨ge' },
    date: '2026-06-30T17:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 2.50, draw: 3.30, away: 2.80 } },

  { homeTeam: { name: 'France' }, awayTeam: { name: 'SuÃ¨de' },
    date: '2026-06-30T21:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 1.25, draw: 6.00, away: 12.00 } },

  { homeTeam: { name: 'Mexique' }, awayTeam: { name: 'Ãquateur' },
    date: '2026-07-01T01:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 1.70, draw: 3.60, away: 5.50 } },

  { homeTeam: { name: 'Angleterre' }, awayTeam: { name: 'Congo DR' },
    date: '2026-07-01T16:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 1.30, draw: 5.50, away: 10.00 } },

  { homeTeam: { name: 'Belgique' }, awayTeam: { name: 'SÃ©nÃ©gal' },
    date: '2026-07-01T20:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 1.55, draw: 4.00, away: 6.50 } },

  { homeTeam: { name: 'Ãtats-Unis' }, awayTeam: { name: 'Bosnie-HerzÃ©govine' },
    date: '2026-07-02T00:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 1.50, draw: 4.20, away: 7.00 } },

  { homeTeam: { name: 'Espagne' }, awayTeam: { name: 'Autriche' },
    date: '2026-07-02T19:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 1.55, draw: 3.90, away: 6.50 } },

  { homeTeam: { name: 'Portugal' }, awayTeam: { name: 'Croatie' },
    date: '2026-07-02T23:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 1.65, draw: 3.70, away: 5.50 } },

  { homeTeam: { name: 'Suisse' }, awayTeam: { name: 'AlgÃ©rie' },
    date: '2026-07-03T03:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 1.70, draw: 3.60, away: 5.00 } },

  { homeTeam: { name: 'Australie' }, awayTeam: { name: 'Ãgypte' },
    date: '2026-07-03T18:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 2.10, draw: 3.30, away: 3.50 } },

  { homeTeam: { name: 'Argentine' }, awayTeam: { name: 'Cabo Verde' },
    date: '2026-07-03T22:00:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 1.10, draw: 9.00, away: 25.00 } },

  { homeTeam: { name: 'Colombie' }, awayTeam: { name: 'Ghana' },
    date: '2026-07-04T01:30:00Z', competition: 'HuitiÃ¨mes de finale', phase: 'HuitiÃ¨mes de finale',
    status: 'upcoming',
    odds: { home: 1.65, draw: 3.70, away: 5.50 } },

];
