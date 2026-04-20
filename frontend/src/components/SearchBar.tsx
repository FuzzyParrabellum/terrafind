import { useState } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import type { HomeSearch } from '../routes/index'

// Correspondance label affiché → valeur envoyée à l'API Django.
// La clé vide '' représente "Tous types" (filtre inactif).
const TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Tous types',        value: '' },
  { label: 'Appartement',       value: 'Appartement' },
  { label: 'Maison',            value: 'Maison' },
  { label: 'Terrain',           value: 'Terrain' },
  { label: 'Local commercial',  value: 'Local industriel. commercial ou assimilé' },
]

export default function SearchBar() {
  const search   = useSearch({ from: '/' })
  const navigate = useNavigate()

  // État local pour la valeur en cours de saisie dans le champ texte.
  // On utilise useState (pas directement search.commune) pour que chaque frappe
  // ne déclenche pas une navigation — on navigue seulement au submit.
  const [inputValue, setInputValue] = useState(search.commune ?? '')

  function submitCommune() {
    navigate({
      to: '/',
      search: prev => ({
        ...prev,
        commune: inputValue.trim() || undefined,
        page: undefined,
      } as HomeSearch),
    })
  }

  function setTypeLocal(value: string) {
    navigate({
      to: '/',
      search: prev => ({
        ...prev,
        // '' signifie "Tous types" → on supprime le filtre de l'URL
        type_local: value || undefined,
        // Réinitialiser pieces_min si on change de type, car ce filtre
        // n'est valide que pour Maison et Appartement
        pieces_min: undefined,
        page: undefined,
      } as HomeSearch),
    })
  }

  return (
    <div className="px-6 pb-8 bg-white border-b border-stone-100">

      {/* Champ de recherche par commune --------------------------------- */}
      <div className="flex items-center gap-2 max-w-xl mx-auto bg-white border border-stone-200 rounded-xl px-3 py-2 mb-4 focus-within:border-teal-400 transition-colors">
        <svg className="shrink-0 text-stone-300" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          // input contrôlé : value reflète l'état local, onChange le met à jour.
          // La navigation n'a lieu qu'au submit (bouton ou touche Entrée).
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submitCommune() }}
          placeholder="Ville, code postal…"
          className="flex-1 bg-transparent text-sm text-stone-800 placeholder-stone-300 outline-none"
        />
        <button
          onClick={submitCommune}
          className="px-4 py-1.5 rounded-lg bg-teal-400 hover:bg-teal-600 text-teal-900 text-sm font-medium transition-colors whitespace-nowrap"
        >
          Rechercher
        </button>
      </div>

      {/* Boutons de filtre rapide par type ------------------------------ */}
      <div className="flex flex-wrap gap-2 justify-center">
        {TYPE_OPTIONS.map(({ label, value }) => {
          // Un bouton est "actif" si sa valeur correspond au filtre URL actuel.
          // Pour "Tous types" (value=''), il est actif quand aucun type n'est sélectionné.
          const isActive = (search.type_local ?? '') === value
          return (
            <button
              key={value}
              onClick={() => setTypeLocal(value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                isActive
                  ? 'border-teal-400 bg-teal-50 text-teal-800'
                  : 'border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

    </div>
  )
}
