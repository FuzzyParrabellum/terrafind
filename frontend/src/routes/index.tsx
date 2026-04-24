import { createFileRoute } from '@tanstack/react-router'
import Hero from '../components/home/Hero'
import SearchBar from '../components/home/SearchBar'
import StatsBar from '../components/home/StatsBar'
import Sidebar from '../components/home/Sidebar'
import ResultsList from '../components/home/ResultsList'

export interface HomeSearch {
  commune:     string | undefined
  type_local:  string | undefined
  prix_min:    number | undefined
  prix_max:    number | undefined
  surface_min: number | undefined
  surface_max: number | undefined
  pieces_min:  number | undefined
  annee_debut: number | undefined
  annee_fin:   number | undefined
  ordering:    string | undefined
  page:        number | undefined
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    commune:     typeof search.commune     === 'string' ? search.commune     : undefined,
    type_local:  typeof search.type_local  === 'string' ? search.type_local  : undefined,
    // Pour les champs numériques, on accepte deux cas :
    //   1. Venant de l'URL (après rechargement) : la valeur est une string → Number("150000")
    //   2. Venant d'une navigation programmatique (applyFilters) : la valeur est déjà un number → Number(150000)
    // On utilise `!= null && !== ''` plutôt que `typeof === 'string'` pour couvrir les deux cas.
    prix_min:    search.prix_min    != null && search.prix_min    !== '' ? Number(search.prix_min)    : undefined,
    prix_max:    search.prix_max    != null && search.prix_max    !== '' ? Number(search.prix_max)    : undefined,
    surface_min: search.surface_min != null && search.surface_min !== '' ? Number(search.surface_min) : undefined,
    surface_max: search.surface_max != null && search.surface_max !== '' ? Number(search.surface_max) : undefined,
    pieces_min:  search.pieces_min  != null && search.pieces_min  !== '' ? Number(search.pieces_min)  : undefined,
    annee_debut: search.annee_debut != null && search.annee_debut !== '' ? Number(search.annee_debut) : undefined,
    annee_fin:   search.annee_fin   != null && search.annee_fin   !== '' ? Number(search.annee_fin)   : undefined,
    ordering:    typeof search.ordering    === 'string' ? search.ordering    : undefined,
    page:        search.page        != null && search.page        !== '' ? Number(search.page)        : undefined,
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <Hero />
      <SearchBar />
      <StatsBar />
      <div className="flex flex-1">
        <Sidebar />
        <ResultsList />
      </div>
    </>
  )
}
