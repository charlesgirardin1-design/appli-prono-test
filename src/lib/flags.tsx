import React from 'react';

export const FLAG_CODES: Record<string, string> = {
  'Mexique': 'mx', 'Afrique du Sud': 'za', 'Corée du Sud': 'kr', 'Tchéquie': 'cz',
  'Canada': 'ca', 'Bosnie-Herzégovine': 'ba', 'Suisse': 'ch', 'Qatar': 'qa',
  'Brésil': 'br', 'Maroc': 'ma', 'Haïti': 'ht', 'Écosse': 'gb-sct',
  'États-Unis': 'us', 'Paraguay': 'py', 'Australie': 'au', 'Türkiye': 'tr',
  'Allemagne': 'de', 'Curaçao': 'cw', "Côte d'Ivoire": 'ci', 'Équateur': 'ec',
  'Pays-Bas': 'nl', 'Japon': 'jp', 'Suède': 'se', 'Tunisie': 'tn',
  'Belgique': 'be', 'Égypte': 'eg', 'Iran': 'ir', 'Nouvelle-Zélande': 'nz',
  'Espagne': 'es', 'Cabo Verde': 'cv', 'Arabie Saoudite': 'sa', 'Uruguay': 'uy',
  'France': 'fr', 'Sénégal': 'sn', 'Norvège': 'no', 'Irak': 'iq',
  'Argentine': 'ar', 'Algérie': 'dz', 'Autriche': 'at', 'Jordanie': 'jo',
  'Portugal': 'pt', 'Congo DR': 'cd', 'Ouzbékistan': 'uz', 'Colombie': 'co',
  'Angleterre': 'gb-eng', 'Croatie': 'hr', 'Ghana': 'gh', 'Panama': 'pa',
};

// Special emoji flags that can't be derived from 2-letter code
const SPECIAL_EMOJI: Record<string, string> = {
  'gb-eng': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'gb-sct': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
};

export function getEmojiFlag(countryName: string): string {
  const code = FLAG_CODES[countryName];
  if (!code) return '';
  if (SPECIAL_EMOJI[code]) return SPECIAL_EMOJI[code];
  // Build emoji from ISO 3166-1 alpha-2 (regional indicator letters)
  const offset = 127397;
  return code.toUpperCase().substring(0, 2)
    .split('')
    .map(c => String.fromCodePoint(c.charCodeAt(0) + offset))
    .join('');
}

export function getFlagUrl(countryName: string, size: number = 32): string {
  const code = FLAG_CODES[countryName];
  if (!code) return '';
  return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`;
}

export function FlagImg({
  name, size = 24, className = '',
}: { name: string; size?: number; className?: string }) {
  const emoji = getEmojiFlag(name);
  if (!emoji) return null;
  return (
    <span
      className={`flag-emoji ${className}`}
      style={{ fontSize: size, lineHeight: 1 }}
      role="img"
      aria-label={name}
    >
      {emoji}
    </span>
  );
}
