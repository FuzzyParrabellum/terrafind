import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  type TooltipItem,
} from 'chart.js'

import { useStatsMultiple, type StatsSerie } from '../../hooks/useStatsMultiple'
import Spinner from '../ui/Spinner'

// Legend est enregistré ici (absent de PriceChart) car ce graphique multi-séries
// en a besoin pour distinguer les courbes.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

interface PriceM2ChartProps {
  series: StatsSerie[]
}

export default function PriceM2Chart({ series }: PriceM2ChartProps) {
  const results = useStatsMultiple(series)

  if (results.some(r => r.isLoading)) return <Spinner label="Chargement du graphique…" />

  // Construit la liste ordonnée de toutes les périodes présentes dans au moins
  // une série. On utilise "AAAA-S" comme clé de tri stable.
  const periodeSet = new Set<string>()
  results.forEach(r =>
    r.data?.par_periode.forEach(p => periodeSet.add(`${p.annee}-${p.semestre}`))
  )
  const sortedKeys = [...periodeSet].sort()

  if (sortedKeys.length === 0) {
    return (
      <p className="text-sm text-stone-400 text-center py-8">
        Pas assez de données pour afficher le graphique.
      </p>
    )
  }

  const labels = sortedKeys.map(k => {
    const [annee, sem] = k.split('-')
    return `${annee} S${sem}`
  })

  const datasets = series.map((serie, i) => {
    const periodes = results[i].data?.par_periode ?? []

    return {
      label: serie.label,
      // Pour chaque période de l'axe X, on cherche la valeur dans cette série.
      // null → Chart.js laisse un trou dans la courbe (spanGaps: false).
      data: sortedKeys.map(k => {
        const [anneeStr, semStr] = k.split('-')
        const entry = periodes.find(
          p => p.annee === Number(anneeStr) && p.semestre === Number(semStr)
        )
        return entry?.prix_m2_median != null ? Math.round(entry.prix_m2_median) : null
      }),
      borderColor:          serie.color,
      backgroundColor:      `${serie.color}18`, // ~10 % d'opacité pour le remplissage
      pointBackgroundColor: serie.color,
      pointRadius:          3,
      pointHoverRadius:     5,
      fill:      false,
      tension:   0.3,
      spanGaps:  false, // laisse un vide si un semestre manque de données
    }
  })

  const chartData = { labels, datasets }

  const options = {
    responsive: true,
    interaction: {
      // Affiche les valeurs de toutes les séries pour le même point X au survol.
      mode:      'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, font: { size: 11 }, color: '#78716c' },
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'line'>) =>
            ` ${ctx.dataset.label} : ${Number(ctx.raw).toLocaleString('fr-FR')} €/m²`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: number | string) =>
            `${Number(value).toLocaleString('fr-FR')} €`,
          font:  { size: 11 },
          color: '#a8a29e',
        },
        grid: { color: '#f5f5f4' },
      },
      x: {
        ticks: {
          font:  { size: 11 },
          color: '#a8a29e',
          maxRotation: 45,
        },
        grid: { display: false },
      },
    },
  }

  return <Line data={chartData} options={options} />
}
