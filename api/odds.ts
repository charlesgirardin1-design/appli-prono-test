import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.ODDS_API_KEY ?? '';
const SPORT = 'soccer_fifa_world_cup';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');
  if (!API_KEY) return res.status(500).json({ error: 'ODDS_API_KEY not set' });
  try {
    const url = 'https://api.the-odds-api.com/v4/sports/' + SPORT +
      '/odds/?apiKey=' + API_KEY + '&regions=eu&markets=h2h&oddsFormat=decimal';
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    const data: any[] = await r.json();
    const odds = data.map((game: any) => {
      const h2h = game.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'h2h');
      if (!h2h) return null;
      const homeOut = h2h.outcomes.find((o: any) => o.name === game.home_team);
      const awayOut = h2h.outcomes.find((o: any) => o.name === game.away_team);
      const drawOut = h2h.outcomes.find((o: any) => o.name === 'Draw');
      return {
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        commenceTime: game.commence_time,
        home: homeOut?.price ?? null,
        draw: drawOut?.price ?? null,
        away: awayOut?.price ?? null,
      };
    }).filter(Boolean);
    return res.json({ odds, remaining: r.headers.get('x-requests-remaining') });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
