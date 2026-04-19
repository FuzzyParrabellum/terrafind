import type { VenteParcelle } from '../types/api'
import { useVentes } from '../hooks/useVentes'
import ResultCard from './ResultCard'
import Spinner from './Spinner'

export default function ResultsList() {
  const { data, isLoading, error } = useVentes()

  return (
    <main className="flex-1 bg-stone-50 px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-400">
          {data ? `${data.count.toLocaleString('fr-FR')} résultats` : '…'}
        </p>
        <select className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-500 focus:outline-none focus:border-teal-400">
          <option>Trier : date (récent)</option>
          <option>Prix croissant</option>
          <option>Prix/m² croissant</option>
        </select>
      </div>

      {isLoading && <Spinner label="Chargement…" />}

      {error && (
        <p className="text-sm text-red-400 text-center py-12">
          Impossible de charger les résultats.
        </p>
      )}

      {data && (
        <div className="space-y-2.5">
          {data.results.map((vente: VenteParcelle) => (
            <ResultCard key={vente.public_id} vente={vente} />
          ))}
        </div>
      )}
    </main>
  )
}
