import { useStats } from '../hooks/useStats'
import { formatPrice } from '../utils/format'

// Calcule l'évolution en % du prix médian entre les deux dernières années disponibles.
// Retourne null si on n'a pas au moins deux années de données.
function computeEvolution(parAnnee: { annee: number; prix_median: string | null }[]): number | null {
  if (parAnnee.length < 2) return null

  // par_annee est déjà trié par année croissante côté Django (order_by("annee")).
  const last    = parAnnee[parAnnee.length - 1]
  const beforeLast = parAnnee[parAnnee.length - 2]

  if (!last.prix_median || !beforeLast.prix_median) return null

  const current  = Number(last.prix_median)
  const previous = Number(beforeLast.prix_median)

  if (previous === 0) return null

  return ((current - previous) / previous) * 100
}

export default function StatsBar() {
  const { data, isLoading } = useStats()

  // Placeholder affiché pendant le chargement pour éviter un saut de layout.
  const placeholder = <span className="text-stone-300">…</span>

  const evolution = data ? computeEvolution(data.par_annee) : null

  // Formatage de l'évolution : "+3,2 %" ou "−1,4 %", avec la bonne couleur.
  const evolutionLabel = evolution !== null
    ? `${evolution >= 0 ? '+' : ''}${evolution.toFixed(1).replace('.', ',')} %`
    : null

  const evolutionColor = evolution !== null && evolution >= 0
    ? 'text-teal-600'
    : 'text-red-400'

  // Récupère la dernière année disponible dans par_annee pour afficher la période.
  const lastYear = data?.par_annee.at(-1)?.annee
  const prevYear = data?.par_annee.at(-2)?.annee

  return (
    <div className="grid grid-cols-3 divide-x divide-stone-100 border-b border-stone-100 bg-white">

      <div className="px-6 py-4 text-center">
        <p className="text-xl font-medium text-stone-900">
          {isLoading ? placeholder : (data ? data.total_ventes.toLocaleString('fr-FR') : '—')}
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5">Ventes dans le Morbihan entre 2021 et 2025</p>
      </div>

      <div className="px-6 py-4 text-center">
        <p className="text-xl font-medium text-stone-900">
          {isLoading ? placeholder : (
            data?.prix_median ? formatPrice(data.prix_median) : '—'
          )}
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5">Prix médian</p>
      </div>

      <div className="px-6 py-4 text-center">
        <p className={`text-xl font-medium ${evolutionColor}`}>
          {isLoading ? placeholder : (evolutionLabel ?? '—')}
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5">
          {/* On affiche les années concernées quand elles sont disponibles */}
          {prevYear && lastYear
            ? `Évolution ${prevYear} → ${lastYear}`
            : 'Évolution annuelle'}
        </p>
      </div>

    </div>
  )
}
