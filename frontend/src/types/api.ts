// ---------------------------------------------------------------------------
// Miroir des serializers Django — à mettre à jour si l'API change
// ---------------------------------------------------------------------------

export interface Commune {
  code_insee: string
  nom: string
  code_departement: string
}

export interface VenteParcelle {
  public_id: string
  commune: Commune
  code_postal: string
  // Django renvoie les dates au format ISO 8601 : "2024-03-12"
  date_mutation: string
  nature_mutation: string
  // DRF sérialise DecimalField en string pour préserver la précision
  valeur_fonciere: string
  types_locaux: string[]
  surface_bien_principal: number | null
  surface_totale: number | null
  nombre_pieces_principales: number | null
  nature_culture: string | null
  surface_terrain: number | null
}

// Structure de pagination renvoyée par DRF PageNumberPagination
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Paramètres de filtrage acceptés par l'endpoint /api/ventes/
export interface VenteFilters {
  commune?: string
  code_postal?: string
  ordering?: string
  page?: number
}
