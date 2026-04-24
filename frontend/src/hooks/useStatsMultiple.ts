import { useQueries } from '@tanstack/react-query'
import { venteService } from '../services/api'
import type { VenteFilters } from '../types/api'

export interface StatsSerie {
  filters: VenteFilters
  label: string
  // Couleur CSS (hex ou rgba) utilisée pour la courbe et le tooltip.
  color: string
}

/**
 * Récupère en parallèle les stats pour plusieurs séries de filtres.
 * Utilise useQueries (TanStack Query) pour éviter de contourner la règle
 * des hooks avec une boucle.
 *
 * Les résultats sont dans le même ordre que `series`.
 */
export function useStatsMultiple(series: StatsSerie[]) {
  return useQueries({
    queries: series.map(({ filters }) => ({
      queryKey: ['stats', filters],
      queryFn:  () => venteService.stats(filters),
    })),
  })
}
