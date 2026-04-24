import { type ChangeEvent } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import type { HomeSearch } from '../../routes/index'

// Correspondance label affiché → valeur envoyée au paramètre ?ordering= de l'API.
// Les valeurs avec un "-" préfixe signifient "ordre décroissant" (convention Django REST).
// ordering_fields autorisés côté Django : ["date_mutation", "valeur_fonciere"] (views.py).
const SORT_OPTIONS = [
  { label: 'Date (récent → ancien)',  value: '-date_mutation'  },
  { label: 'Date (ancien → récent)',  value: 'date_mutation'   },
  { label: 'Prix croissant',          value: 'valeur_fonciere'  },
  { label: 'Prix décroissant',        value: '-valeur_fonciere' },
]

// Valeur par défaut : doit correspondre à `ordering` dans VenteParcelleViewSet (views.py).
const DEFAULT_ORDERING = '-date_mutation'

export default function SortSelect() {
  const search   = useSearch({ from: '/' })
  const navigate = useNavigate()

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    navigate({
      to: '/',
      search: prev => ({
        ...prev,
        ordering: e.target.value,
        // On remet la pagination à zéro quand on change le tri :
        // sans ça, l'utilisateur resterait sur la page 3 d'un nouveau tri
        // qui n'a peut-être que 2 pages.
        page: undefined,
      } as HomeSearch),
    })
  }

  return (
    <select
      value={search.ordering ?? DEFAULT_ORDERING}
      onChange={handleChange}
      className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-500 focus:outline-none focus:border-teal-400"
    >
      {SORT_OPTIONS.map(({ label, value }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )
}
