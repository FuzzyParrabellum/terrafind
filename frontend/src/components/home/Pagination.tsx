import { useNavigate } from '@tanstack/react-router'
import type { HomeSearch } from '../../routes/index'

interface PaginationProps {
  // Nombre total de résultats renvoyé par l'API (data.count).
  totalCount: number
  // Taille d'une page — doit correspondre à PAGE_SIZE côté Django (20).
  pageSize: number
  // Page actuellement affichée (1-indexé). undefined → page 1 implicite.
  currentPage: number | undefined
}

// buildPages construit la liste des numéros à afficher, avec null pour les "…".
// Exemples :
//   page=1,  total=256 → [1, 2, 3, null, 256]
//   page=85, total=256 → [1, null, 84, 85, 86, null, 256]
//   page=254,total=256 → [1, null, 254, 255, 256]
function buildPages(current: number, total: number): (number | null)[] {
  if (total <= 1) return [1]

  // On affiche toujours la première et la dernière page.
  // Autour de la page courante, on montre une fenêtre de ±1 page.
  const WINDOW = 1

  const pages: (number | null)[] = []
  let prev: number | null = null

  for (let p = 1; p <= total; p++) {
    const isFirst   = p === 1
    const isLast    = p === total
    const inWindow  = Math.abs(p - current) <= WINDOW

    if (isFirst || isLast || inWindow) {
      // Si le numéro précédent inséré n'est pas juste avant, ajouter un "…".
      if (prev !== null && p - prev > 1) pages.push(null)
      pages.push(p)
      prev = p
    }
  }

  return pages
}

export default function Pagination({ totalCount, pageSize, currentPage }: PaginationProps) {
  const navigate = useNavigate()
  const current   = currentPage ?? 1
  const totalPages = Math.ceil(totalCount / pageSize)

  // Pas besoin de widget si tout tient sur une seule page.
  if (totalPages <= 1) return null

  function goTo(page: number) {
    navigate({
      to: '/',
      // On conserve tous les filtres actifs, on ne change que la page.
      // page=1 est implicite : on la supprime de l'URL pour garder l'URL propre.
      search: prev => ({
        ...prev,
        page: page === 1 ? undefined : page,
      } as HomeSearch),
    })
  }

  const pages = buildPages(current, totalPages)

  return (
    <div data-cy="pagination" className="flex justify-end items-center gap-1 pt-4 pb-2">
      {/* Bouton "Précédent" */}
      <button
        onClick={() => goTo(current - 1)}
        disabled={current === 1}
        className="px-2 py-1 rounded-lg text-xs text-stone-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ←
      </button>

      {pages.map((page, i) =>
        page === null ? (
          // Séparateur "…" — la clé inclut l'index pour éviter les doublons
          // si on a deux ellipsis dans la même liste.
          <span key={`ellipsis-${i}`} className="px-1 text-xs text-stone-300 select-none">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goTo(page)}
            className={`min-w-[28px] px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
              page === current
                ? 'bg-teal-400 text-teal-900'
                : 'text-stone-500 hover:text-teal-600 hover:bg-teal-50'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Bouton "Suivant" */}
      <button
        onClick={() => goTo(current + 1)}
        disabled={current === totalPages}
        className="px-2 py-1 rounded-lg text-xs text-stone-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        →
      </button>
    </div>
  )
}
