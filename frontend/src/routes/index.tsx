import { createFileRoute } from '@tanstack/react-router'
import Hero from '../components/Hero'
import SearchBar from '../components/SearchBar'
import StatsBar from '../components/StatsBar'
import Sidebar from '../components/Sidebar'
import ResultsList from '../components/ResultsList'

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
    prix_min:    typeof search.prix_min    === 'string' ? Number(search.prix_min)    : undefined,
    prix_max:    typeof search.prix_max    === 'string' ? Number(search.prix_max)    : undefined,
    surface_min: typeof search.surface_min === 'string' ? Number(search.surface_min) : undefined,
    surface_max: typeof search.surface_max === 'string' ? Number(search.surface_max) : undefined,
    pieces_min:  typeof search.pieces_min  === 'string' ? Number(search.pieces_min)  : undefined,
    annee_debut: typeof search.annee_debut === 'string' ? Number(search.annee_debut) : undefined,
    annee_fin:   typeof search.annee_fin   === 'string' ? Number(search.annee_fin)   : undefined,
    ordering:    typeof search.ordering    === 'string' ? search.ordering    : undefined,
    page:        typeof search.page        === 'string' ? Number(search.page)        : undefined,
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <Hero />
      <SearchBar />
      <StatsBar />
      <div className="flex min-h-screen">
        <Sidebar />
        <ResultsList />
      </div>
    </>
  )
}
