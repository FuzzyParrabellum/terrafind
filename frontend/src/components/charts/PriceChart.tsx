import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type TooltipItem,
} from 'chart.js'

import { useStats } from '../../hooks/useStats'
import type { VenteFilters } from '../../types/api'
import Spinner from '../ui/Spinner'

// Chart.js utilise un système de plugins opt-in : chaque composant doit être
// enregistré explicitement avant d'être utilisé dans un graphique.
// Sans ce register(), Chart.js lève "X is not a registered scale/element".
// On le fait ici (à l'import du composant) plutôt que dans main.tsx pour
// ne pas charger Chart.js si PriceChart n'est jamais monté.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

interface PriceChartProps {
  // Filtres optionnels transmis à useStats().
  // Sans filtre → stats globales Morbihan.
  // Avec { commune: 'Vannes' } → stats de Vannes uniquement (usage page Comparer).
  filters?: VenteFilters
  // Libellé de la courbe affiché dans les tooltips — utile sur la page Comparer
  // pour distinguer les deux communes.
  label?: string
}

export default function PriceChart({ filters = {}, label = 'Prix médian' }: PriceChartProps) {
  const { data, isLoading } = useStats(filters)

  if (isLoading) return <Spinner label="Chargement du graphique…" />

  // On retire les semestres sans médiane (possible si peu de ventes sur cette période).
  const parPeriode = (data?.par_periode ?? []).filter(e => e.prix_median !== null)

  if (parPeriode.length === 0) {
    return (
      <p className="text-sm text-stone-400 text-center py-8">
        Pas assez de données pour afficher le graphique.
      </p>
    )
  }

  const chartData = {
    // "2024 S1", "2024 S2", … — label lisible pour chaque semestre
    labels: parPeriode.map(e => `${e.annee} S${e.semestre}`),
    datasets: [
      {
        label,
        data: parPeriode.map(e => Number(e.prix_median)),
        // Couleurs cohérentes avec la charte teal du site.
        borderColor:          '#2dd4bf',              // teal-400
        backgroundColor:      'rgba(45,212,191,0.08)', // teal-400 à 8% d'opacité
        pointBackgroundColor: '#2dd4bf',
        pointRadius:          4,
        pointHoverRadius:     6,
        fill:    true,
        tension: 0.3, // légère courbe de Bézier pour adoucir la ligne
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      // On n'affiche pas la légende car le titre du composant suffit.
      // Sur la page Comparer, chaque graphique sera titré par la commune.
      legend: { display: false },
      tooltip: {
        callbacks: {
          // Formatage FR des montants dans les tooltips : "285 000 €"
          label: (ctx: TooltipItem<'line'>) =>
            ` ${Number(ctx.raw).toLocaleString('fr-FR')} €`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          // Formatage FR sur l'axe Y : "285 000 €"
          callback: (value: number | string) =>
            `${Number(value).toLocaleString('fr-FR')} €`,
          font:  { size: 11 },
          color: '#a8a29e', // stone-400
        },
        grid: { color: '#f5f5f4' }, // stone-100 — grille très discrète
      },
      x: {
        ticks: {
          font:  { size: 11 },
          color: '#a8a29e',
        },
        grid: { display: false },
      },
    },
  } as const

  return <Line data={chartData} options={options} />
}
