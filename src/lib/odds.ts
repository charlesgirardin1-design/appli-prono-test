import { Match } from '../types';

interface ApiOdds {
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  home: number | null;
  draw: number | null;
  away: number | null;
}

function normalize(name: string): string {
  return name.toLowerCase()
    .replace(/[éèêë]/g, 'e').replace(/[àâ]/g, 'a')
    .replace(/[^a-z]/g, '');
}

export async function fetchAndApplyOdds(matches: Match[]): Promise<Match[]> {
  try {
    const res = await fetch('/api/odds');
    if (!res.ok) return matches;
    const data: { odds: ApiOdds[] } = await res.json();
    if (!data.odds?.length) return matches;

    return matches.map(match => {
      const homeN = normalize(match.homeTeam.name);
      const awayN = normalize(match.awayTeam.name);
      const found = data.odds.find(o => {
        const oH = normalize(o.homeTeam);
        const oA = normalize(o.awayTeam);
        return (oH.includes(homeN) || homeN.includes(oH)) &&
               (oA.includes(awayN) || awayN.includes(oA));
      });
      if (!found || !found.home || !found.away) return match;
      return {
        ...match,
        odds: {
          home: Math.round(found.home * 100) / 100,
          draw: Math.round((found.draw ?? 3.5) * 100) / 100,
          away: Math.round(found.away * 100) / 100,
        },
      };
    });
  } catch {
    return matches;
  }
}
