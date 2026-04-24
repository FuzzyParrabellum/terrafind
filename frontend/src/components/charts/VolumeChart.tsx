import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  type TooltipItem,
} from 'chart.js'

import { useStats } from '../../hooks/useStats'
import type { VenteFilters } from '../../types/api'
import Spinner from '../ui/Spinner'

// BarElement est l'élément graphique propre aux histogrammes — distinct de
// LineElement utilisé dans PriceChart. Chaque composant enregistre ce dont
// il a besoin pour ne pas charger inutilement des modules non utilisés.
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

interface VolumeChartProps {
  filters?: VenteFilters
}

export default function VolumeChart({ filters = {} }: VolumeChartProps) {
  const { data, isLoading } = useStats(filters)

  if (isLoading) return <Spinner label="Chargement du graphique…" />

  const parPeriode = data?.par_periode ?? []

  if (parPeriode.length === 0) {
    return (
      <p className="text-sm text-stone-400 text-center py-8">
        Pas assez de données pour afficher le graphique.
      </p>
    )
  }

  const chartData = {
    labels: parPeriode.map(e => `${e.annee} S${e.semestre}`),
    datasets: [
      {
        label: 'Transactions',
        data: parPeriode.map(e => e.nb_ventes),
        // S1 (jan–juin) légèrement plus foncé que S2 pour distinguer visuellement
        // les deux semestres d'une même année sans avoir besoin d'une légende.
        backgroundColor: parPeriode.map(e =>
          e.semestre === 1 ? 'rgba(45,212,191,0.75)' : 'rgba(45,212,191,0.45)'
        ),
        borderColor: parPeriode.map(e =>
          e.semestre === 1 ? '#2dd4bf' : '#5eead4'
        ),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) =>
            ` ${Number(ctx.raw).toLocaleString('fr-FR')} ventes`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: number | string) =>
            Number(value).toLocaleString('fr-FR'),
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

  return <Bar data={chartData} options={options} />
}
