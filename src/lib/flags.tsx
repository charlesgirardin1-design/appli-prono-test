
import React from 'react';

// Mapping nom pays → code ISO 3166-1 alpha-2 pour flagcdn.com
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
  // clubs (si besoin futur)
};

export function getFlagUrl(countryName: string, size: number = 32): string {
  const code = FLAG_CODES[countryName];
  if (!code) return '';
  return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`;
}

export function FlagImg({
  name, size = 24, className = '',
}: { name: string; size?: number; className?: string }) {
  const url = getFlagUrl(name, size * 2); // 2x for retina
  if (!url) return null;
  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={Math.round(size * 0.67)}
      className={`flag-img ${className}`}
      style={{ borderRadius: 2, objectFit: 'cover' }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}
