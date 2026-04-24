import { useQuery } from '@tanstack/react-query'

import { venteService } from '../services/api'
import type { VenteFilters } from '../types/api'

/**
 * Hook de récupération des statistiques agrégées depuis /api/ventes/stats/.
 *
 * Utilisation :
 *   const { data, isLoading } = useStats()
 *
 * - data      : VenteStats | undefined
 * - isLoading : true pendant le premier chargement
 *
 * Les stats globales (sans filtre) sont mises en cache sous la clé ['stats', {}].
 * Si des filtres sont passés, chaque combinaison a sa propre entrée de cache.
 */
export function useStats(filters: VenteFilters = {}) {
  return useQuery({
    queryKey: ['stats', filters],
    queryFn:  () => venteService.stats(filters),
  })
}
