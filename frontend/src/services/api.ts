import type { PaginatedResponse, VenteParcelle, VenteFilters, VenteStats } from '../types/api'

// Le chemin /api est intercepté par le proxy Vite en développement
// et redirigé vers Django (http://back:8000).
// En production, Nginx le redirigera directement.
const BASE = '/api'

// ---------------------------------------------------------------------------
// Utilitaire HTTP interne
// ---------------------------------------------------------------------------

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(path, window.location.origin)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== '') url.searchParams.set(key, value)
  })

  const res = await fetch(url.toString())

  if (!res.ok) {
    // On remonte une erreur lisible avec le statut HTTP pour que
    // TanStack Query puisse la capturer et l'exposer au composant.
    throw new Error(`Erreur API : ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Ventes
// ---------------------------------------------------------------------------

export const venteService = {
  /**
   * GET /api/ventes/
   * Retourne une page de ventes, filtrée selon les paramètres fournis.
   */
  list(filters: VenteFilters = {}): Promise<PaginatedResponse<VenteParcelle>> {
    const params: Record<string, string> = {}
    if (filters.commune)     params.commune      = filters.commune
    if (filters.code_postal) params.code_postal  = filters.code_postal
    if (filters.type_local)  params.type_local   = filters.type_local
    if (filters.prix_min)    params.prix_min     = String(filters.prix_min)
    if (filters.prix_max)    params.prix_max     = String(filters.prix_max)
    if (filters.surface_min)  params.surface_min  = String(filters.surface_min)
    if (filters.surface_max)  params.surface_max  = String(filters.surface_max)
    if (filters.pieces_min)   params.pieces_min   = String(filters.pieces_min)
    if (filters.annee_debut)  params.annee_debut  = String(filters.annee_debut)
    if (filters.annee_fin)    params.annee_fin    = String(filters.annee_fin)
    if (filters.ordering)     params.ordering     = filters.ordering
    if (filters.page)         params.page         = String(filters.page)
    return get<PaginatedResponse<VenteParcelle>>(`${BASE}/ventes/`, params)
  },

  /**
   * GET /api/ventes/stats/
   * Retourne les statistiques agrégées (total, médiane, évolution par année).
   * Accepte les mêmes filtres que list() pour limiter le périmètre des stats.
   */
  stats(filters: VenteFilters = {}): Promise<VenteStats> {
    const params: Record<string, string> = {}
    if (filters.commune)     params.commune     = filters.commune
    if (filters.type_local)  params.type_local  = filters.type_local
    if (filters.annee_debut) params.annee_debut = String(filters.annee_debut)
    if (filters.annee_fin)   params.annee_fin   = String(filters.annee_fin)
    return get<VenteStats>(`${BASE}/ventes/stats/`, params)
  },
}
