import { useState } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import type { HomeSearch } from '../routes/index'

const ANNEES = [2021, 2022, 2023, 2024, 2025]

// Le filtre Pièces n'a de sens que pour les biens habitables.
// Terrains, dépendances et locaux commerciaux n'ont pas de pièces.
const TYPES_AVEC_PIECES = ['Maison', 'Appartement']

export default function Sidebar() {
  const search   = useSearch({ from: '/' })
  const navigate = useNavigate()

  // État local : reflète ce que l'utilisateur est en train de configurer,
  // pas encore ce qui est appliqué (pas dans l'URL). Initialisé depuis l'URL
  // au premier rendu pour que les filtres actifs restent visibles après rechargement.
  const [local, setLocal] = useState({
    commune:     search.commune     ?? '',
    type_local:  search.type_local  ?? '',
    prix_min:    search.prix_min    ?? '',
    prix_max:    search.prix_max    ?? '',
    surface_min: search.surface_min ?? '',
    surface_max: search.surface_max ?? '',
    pieces_min:  search.pieces_min  ?? '',
    annee_debut: search.annee_debut ?? '',
    annee_fin:   search.annee_fin   ?? '',
  })

  // Met à jour un seul champ de l'état local sans déclencher de navigation.
  function set(key: string, value: string | number) {
    setLocal(prev => ({ ...prev, [key]: value }))
  }

  // Applique tous les filtres locaux en une seule navigation.
  // Les champs vides sont convertis en undefined pour rester absents de l'URL.
  // Un seul appel API est déclenché, peu importe combien de filtres ont changé.
  function applyFilters() {
    navigate({
      to: '/',
      search: {
        commune:     local.commune     || undefined,
        type_local:  local.type_local  || undefined,
        prix_min:    local.prix_min    ? Number(local.prix_min)    : undefined,
        prix_max:    local.prix_max    ? Number(local.prix_max)    : undefined,
        surface_min: local.surface_min ? Number(local.surface_min) : undefined,
        surface_max: local.surface_max ? Number(local.surface_max) : undefined,
        pieces_min:  local.pieces_min  ? Number(local.pieces_min)  : undefined,
        annee_debut: local.annee_debut ? Number(local.annee_debut) : undefined,
        annee_fin:   local.annee_fin   ? Number(local.annee_fin)   : undefined,
        // On conserve le tri actif, on réinitialise la pagination.
        ordering: search.ordering,
        page:     undefined,
      } as HomeSearch,
    })
  }

  // Vide l'état local ET l'URL en une seule action.
  function resetFilters() {
    const empty = {
      commune: '', type_local: '', prix_min: '', prix_max: '',
      surface_min: '', surface_max: '', pieces_min: '',
      annee_debut: '', annee_fin: '',
    }
    setLocal(empty)
    navigate({
      to: '/',
      search: { ordering: search.ordering } as HomeSearch,
    })
  }

  // showPieces se base sur l'état LOCAL (pas l'URL) pour réagir
  // immédiatement quand l'utilisateur change le type, avant de soumettre.
  const showPieces = TYPES_AVEC_PIECES.includes(local.type_local)

  // Regrouper la condition ici plutôt que dans le JSX pour plus de lisibilité.
  // Le !! convertit la valeur en vrai booléen ('' et undefined → false).
  const hasActiveFilters = !!(
    local.commune || local.type_local || local.prix_min || local.prix_max ||
    local.surface_min || local.surface_max || local.pieces_min ||
    local.annee_debut || local.annee_fin
  )

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-stone-100 px-4 py-5 flex flex-col gap-6">

      {/* Commune -------------------------------------------------------- */}
      <div>
        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-2.5">Commune</p>
        <input
          type="text"
          placeholder="Ex : Vannes, Lorient…"
          value={local.commune}
          // onChange met à jour l'état local uniquement — pas de navigation, pas de fetch.
          onChange={e => set('commune', e.target.value)}
          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-teal-400"
        />
        <p className="text-[11px] text-stone-300 mt-1">nom ou code INSEE</p>
      </div>

      {/* Type de bien --------------------------------------------------- */}
      <div>
        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-2.5">Type de bien</p>
        <select
          value={local.type_local}
          onChange={e => set('type_local', e.target.value)}
          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400"
        >
          <option value="">Tous les types</option>
          <option value="Maison">Maison</option>
          <option value="Appartement">Appartement</option>
          <option value="Local industriel. commercial ou assimilé">Local commercial</option>
          <option value="Dépendance">Dépendance</option>
        </select>
      </div>

      {/* Pièces — uniquement visible pour Maison et Appartement --------- */}
      {showPieces && (
        <div>
          <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-2.5">Pièces</p>
          <select
            value={local.pieces_min}
            onChange={e => set('pieces_min', e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400"
          >
            <option value="">Toutes</option>
            <option value="1">Studio / T1 (1 pièce min.)</option>
            <option value="2">T2 (2 pièces min.)</option>
            <option value="3">T3 (3 pièces min.)</option>
            <option value="4">T4 et plus (4 pièces min.)</option>
          </select>
        </div>
      )}

      {/* Prix de vente -------------------------------------------------- */}
      <div>
        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-2.5">Prix de vente</p>
        <div className="flex items-center gap-2 mb-1.5">
          <input
            type="number"
            value={local.prix_min}
            onChange={e => set('prix_min', e.target.value)}
            placeholder="Min"
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400"
          />
          <span className="text-stone-300 text-xs shrink-0">—</span>
          <input
            type="number"
            value={local.prix_max}
            onChange={e => set('prix_max', e.target.value)}
            placeholder="Max"
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400"
          />
        </div>
        <p className="text-[11px] text-stone-300">en euros</p>
      </div>

      {/* Surface ------------------------------------------------------- */}
      <div>
        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-2.5">Surface</p>
        <div className="flex items-center gap-2 mb-1.5">
          <input
            type="number"
            value={local.surface_min}
            onChange={e => set('surface_min', e.target.value)}
            placeholder="Min"
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400"
          />
          <span className="text-stone-300 text-xs shrink-0">—</span>
          <input
            type="number"
            value={local.surface_max}
            onChange={e => set('surface_max', e.target.value)}
            placeholder="Max"
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400"
          />
        </div>
        <p className="text-[11px] text-stone-300">en m²</p>
      </div>

      {/* Période ------------------------------------------------------- */}
      <div>
        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-2.5">Période</p>
        <div className="flex items-center gap-2">
          <select
            value={local.annee_debut}
            onChange={e => set('annee_debut', e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400"
          >
            <option value="">De…</option>
            {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <span className="text-stone-300 text-xs shrink-0">—</span>
          <select
            value={local.annee_fin}
            onChange={e => set('annee_fin', e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400"
          >
            <option value="">À…</option>
            {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Actions -------------------------------------------------------- */}
      <div className="flex flex-col gap-2">
        <button
          onClick={applyFilters}
          className="w-full text-xs py-2 rounded-lg bg-teal-400 hover:bg-teal-500 text-teal-900 font-medium transition-colors"
        >
          Appliquer les filtres
        </button>
        {/* Le bouton "Réinitialiser" n'apparaît que si au moins un filtre local est rempli */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="w-full text-xs py-1.5 rounded-lg border border-stone-200 text-stone-400 hover:border-teal-400 hover:text-teal-600 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

    </aside>
  )
}
