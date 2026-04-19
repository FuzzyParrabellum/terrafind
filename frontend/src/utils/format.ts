// ---------------------------------------------------------------------------
// Fonctions de mise en forme des données DVF
// Toutes sont pures (pas d'effets de bord) et réutilisables hors React.
// ---------------------------------------------------------------------------

/**
 * "387000.00" → "387 000 €"
 * toLocaleString('fr-FR') utilise l'espace fine insécable comme séparateur
 * de milliers, conforme à la typographie française.
 */
export function formatPrice(valeur: string): string {
  const n = Math.round(parseFloat(valeur))
  return n.toLocaleString('fr-FR') + '\u00a0€'
}

/**
 * Calcule et formate le prix au m² à partir du prix total et de la surface.
 * Retourne null si la surface est nulle ou zéro (division impossible).
 */
export function formatPricePerSqm(valeur: string, surface: number | null): string | null {
  if (!surface) return null
  const n = Math.round(parseFloat(valeur) / surface)
  return n.toLocaleString('fr-FR') + '\u00a0€/m²'
}

/**
 * "2024-03-12" → "12 mars 2024"
 * Le 'T12:00:00' force l'heure de midi UTC pour éviter le décalage
 * d'un jour selon le fuseau horaire du navigateur.
 */
export function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * 42 → "42 m²"  |  null → "—"
 */
export function formatSurface(surface: number | null): string {
  if (surface === null) return '—'
  return `${surface}\u00a0m²`
}

/**
 * 4 → "4 pièces"  |  1 → "1 pièce"
 * Retourne null si n est 0 ou null : on n'affiche pas ce champ
 * pour les terrains et dépendances qui n'ont pas de pièces.
 */
export function formatRooms(n: number | null): string | null {
  if (!n) return null
  return n === 1 ? '1 pièce' : `${n} pièces`
}
