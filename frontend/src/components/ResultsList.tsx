import type { VenteParcelle } from '../types/api'
import { useSearch } from '@tanstack/react-router'

import { useVentes } from '../hooks/useVentes'
import ResultCard from './ResultCard'
import Spinner from './Spinner'
import Pagination from './Pagination'
import SortSelect from './SortSelect'

// Doit correspondre à REST_FRAMEWORK['PAGE_SIZE'] dans settings.py Django.
const PAGE_SIZE = 20

export default function ResultsList() {
  // useSearch lit les paramètres de l'URL définis dans validateSearch (routes/index.tsx).
  // Si l'URL est /?commune=56260&prix_max=400000, search contient ces valeurs typées.
  const search = useSearch({ from: '/' })

  // On passe les filtres de l'URL directement au hook.
  // Quand l'URL change (filtres modifiés dans Sidebar), search change,
  // le queryKey de TanStack Query change, et un nouveau fetch est déclenché.
  const { data, isLoading, error, refetch } = useVentes({
    commune:     search.commune,
    type_local:  search.type_local,
    prix_min:    search.prix_min,
    prix_max:    search.prix_max,
    surface_min: search.surface_min,
    surface_max: search.surface_max,
    pieces_min:  search.pieces_min,
    annee_debut: search.annee_debut,
    annee_fin:   search.annee_fin,
    ordering:    search.ordering,
    page:        search.page,
  })

  return (
    <main className="flex-1 bg-stone-50 px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-400">
          {isLoading && '…'}
          {data && `${data.count.toLocaleString('fr-FR')} résultat${data.count !== 1 ? 's' : ''}`}
        </p>
        <SortSelect />
      </div>

      {isLoading && <Spinner label="Chargement…" />}

      {error && (
        <div className="flex flex-col items-center gap-3 py-12">
          <p className="text-sm text-red-400">Impossible de charger les résultats.</p>
          <button
            onClick={() => refetch()}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-500 hover:border-teal-400 hover:text-teal-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {data && data.results.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12">
          <p className="text-sm text-stone-400">Aucun résultat pour ces critères.</p>
          <p className="text-xs text-stone-300">Essayez d'élargir votre recherche.</p>
        </div>
      )}

      {data && data.results.length > 0 && (
        <div className="space-y-2.5">
          {data.results.map((vente: VenteParcelle) => (
            <ResultCard key={vente.public_id} vente={vente} />
          ))}
        </div>
      )}

      {/* Widget de pagination — n'apparaît que s'il y a plus d'une page de résultats */}
      {data && (
        <Pagination
          totalCount={data.count}
          pageSize={PAGE_SIZE}
          currentPage={search.page}
        />
      )}
    </main>
  )
}
