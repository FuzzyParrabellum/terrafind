import { useStats } from '../../hooks/useStats'
import { formatPrice } from '../../utils/format'

// Calcule l'évolution en % du prix médian entre le dernier semestre disponible
// et le même semestre de l'année précédente (comparaison year-over-year).
// Retourne null si on ne dispose pas des deux points de comparaison.
function computeEvolution(
  parPeriode: { annee: number; semestre: number; prix_median: string | null }[]
): { pct: number; labelFrom: string; labelTo: string } | null {
  if (parPeriode.length < 2) return null

  // par_periode est trié (annee, semestre) croissant côté Django.
  const last = parPeriode[parPeriode.length - 1]

  // Chercher le même semestre un an avant pour éviter l'effet saisonnier.
  const prev = parPeriode.find(
    p => p.annee === last.annee - 1 && p.semestre === last.semestre
  )

  if (!prev || !last.prix_median || !prev.prix_median) return null

  const pct = ((Number(last.prix_median) - Number(prev.prix_median)) / Number(prev.prix_median)) * 100

  return {
    pct,
    labelFrom: `${prev.annee} S${prev.semestre}`,
    labelTo:   `${last.annee} S${last.semestre}`,
  }
}

export default function StatsBar() {
  const { data, isLoading } = useStats()

  // Placeholder affiché pendant le chargement pour éviter un saut de layout.
  const placeholder = <span className="text-stone-300">…</span>

  const evolution = data ? computeEvolution(data.par_periode) : null

  // Formatage de l'évolution : "+3,2 %" ou "−1,4 %", avec la bonne couleur.
  const evolutionLabel = evolution !== null
    ? `${evolution.pct >= 0 ? '+' : ''}${evolution.pct.toFixed(1).replace('.', ',')} %`
    : null

  const evolutionColor = evolution !== null && evolution.pct >= 0
    ? 'text-teal-600'
    : 'text-red-400'

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
          {/* On affiche les semestres concernés quand la comparaison est disponible */}
          {evolution
            ? `Évolution ${evolution.labelFrom} → ${evolution.labelTo}`
            : 'Évolution annuelle'}
        </p>
      </div>

    </div>
  )
}
