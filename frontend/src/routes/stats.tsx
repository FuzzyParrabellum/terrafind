import { createFileRoute } from '@tanstack/react-router'
import PriceChart from '../components/charts/PriceChart'
import PriceM2Chart from '../components/charts/PriceM2Chart'
import VolumeChart from '../components/charts/VolumeChart'
import type { StatsSerie } from '../hooks/useStatsMultiple'

export const Route = createFileRoute('/stats')({
  component: StatsPage,
})

// Les trois séries du graphique prix/m² : global, grande ville, petite ville.
// Les couleurs sont choisies pour être lisibles ensemble et cohérentes
// avec la charte teal du site (teal pour le global, ambre et indigo pour les communes).
const SERIES_M2: StatsSerie[] = [
  { filters: {},                    label: 'Morbihan (global)', color: '#2dd4bf' }, // teal-400
  { filters: { commune: 'Vannes' }, label: 'Vannes',            color: '#fb923c' }, // orange-400
  { filters: { commune: 'Auray' },  label: 'Auray',             color: '#818cf8' }, // indigo-400
]

function StatsPage() {
  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 flex flex-col gap-10">

      {/* Graphique 1 — prix médian global par semestre */}
      <section>
        <h1 className="text-xl font-semibold text-stone-800 mb-1">
          Évolution des prix — Morbihan
        </h1>
        <p className="text-sm text-stone-400 mb-6">
          Prix médian de vente par semestre, tous types de biens confondus.
        </p>
        <div className="bg-white rounded-xl border border-stone-100 px-6 py-5 shadow-sm">
          <PriceChart />
        </div>
      </section>

      {/* Graphique 2 — volume de transactions par semestre */}
      <section>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          Volume de transactions
        </h2>
        <p className="text-sm text-stone-400 mb-6">
          Nombre de ventes par semestre — S1 (jan–juin) en teal foncé, S2 (juil–déc) en teal clair.
        </p>
        <div className="bg-white rounded-xl border border-stone-100 px-6 py-5 shadow-sm">
          <VolumeChart />
        </div>
      </section>

      {/* Graphique 3 — prix médian au m² par secteur */}
      <section>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          Prix médian au m²
        </h2>
        <p className="text-sm text-stone-400 mb-6">
          Comparaison par semestre entre le marché global, Vannes et Auray.
        </p>
        <div className="bg-white rounded-xl border border-stone-100 px-6 py-5 shadow-sm">
          <PriceM2Chart series={SERIES_M2} />
        </div>
      </section>

    </main>
  )
}
