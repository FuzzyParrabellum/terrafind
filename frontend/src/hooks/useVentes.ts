import { useQuery } from '@tanstack/react-query'

import { venteService } from '../services/api'
import type { VenteFilters } from '../types/api'

/**
 * Hook de récupération des ventes paginées depuis l'API Django.
 *
 * Utilisation :
 *   const { data, isLoading, error } = useVentes({ commune: '56260' })
 *
 * - data      : PaginatedResponse<VenteParcelle> | undefined
 * - isLoading : true pendant le premier chargement
 * - error     : Error | null
 *
 * TanStack Query met automatiquement en cache les résultats.
 * Si le même queryKey est demandé par plusieurs composants,
 * un seul appel HTTP est effectué.
 */
export function useVentes(filters: VenteFilters = {}) {
  return useQuery({
    // La clé identifie cette requête dans le cache.
    // Tout changement dans filters déclenche un nouveau fetch.
    queryKey: ['ventes', filters],
    queryFn: () => venteService.list(filters),
  })
}
