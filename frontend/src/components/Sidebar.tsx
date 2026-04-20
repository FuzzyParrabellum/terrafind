import { useSearch, useNavigate } from '@tanstack/react-router'
import type { HomeSearch } from '../routes/index'

const ANNEES = [2019, 2020, 2021, 2022, 2023, 2024]

// Le filtre Pièces n'a de sens que pour les biens habitables.
// Terrains, dépendances et locaux commerciaux n'ont pas de pièces.
const TYPES_AVEC_PIECES = ['Maison', 'Appartement']

export default function Sidebar() {
  const search = useSearch({ from: '/' })
  const navigate = useNavigate()

  // Met à jour un seul filtre dans l'URL et remet la pagination à 1.
  // prev contient tous les paramètres actuels — on ne modifie que la clé concernée.
  function setFilter(key: string, value: string | number | undefined) {
    navigate({
      to: '/',
      // Le cast `as HomeSearch` est nécessaire car TanStack Router infère `prev`
      // avec des propriétés optionnelles dans les updaters, même si validateSearch
      // retourne un objet avec toutes les clés requises. Le spread est safe en pratique.
      search: prev => ({ ...prev, [key]: value || undefined, page: undefined } as HomeSearch),
    })
  }

/* showPieces — c'est un booléen calculé à partir du filtre type_local actif dans l'URL. 
TYPES_AVEC_PIECES.includes(search.type_local ?? '') retourne true uniquement si la valeur 
est 'Maison' ou 'Appartement'. Le ?? '' transforme undefined en chaîne vide, ce qui n'est 
pas dans le tableau → false. Si showPieces est false, le bloc JSX {showPieces && <div>...</div>} 
ne rend rien du tout.
*/
  const showPieces = TYPES_AVEC_PIECES.includes(search.type_local ?? '')

/* hasActiveFilters — c'est un booléen qui remplace la longue condition inline qui était 
directement dans le JSX du bouton "Réinitialiser". Au lieu d'écrire 
{(search.commune || search.type_local || search.prix_min || ...) && <button>}, on calcule 
la condition une fois avant le return et on l'utilise comme {hasActiveFilters && <button>}. 
Le !! convertit la valeur en vrai booléen (undefined devient false, une string devient true).
*/
  const hasActiveFilters = !!(
    search.commune || search.type_local || search.prix_min || search.prix_max ||
    search.surface_min || search.surface_max || search.pieces_min ||
    search.annee_debut || search.annee_fin
  )

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-stone-100 px-4 py-5 space-y-6">

      {/* Commune -------------------------------------------------------- */}
      <div>
        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-2.5">Commune</p>
        <input
          type="text"
          placeholder="Ex : Vannes, Lorient…"
          defaultValue={search.commune ?? ''}
          // onBlur : on met à jour l'URL quand l'utilisateur quitte le champ,
          // pas à chaque frappe, pour éviter un appel API par caractère.
          onBlur={e => setFilter('commune', e.target.value)}
          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-teal-400"
        />
        <p className="text-[11px] text-stone-300 mt-1">nom ou code INSEE</p>
      </div>

      {/* Type de bien --------------------------------------------------- */}
      <div>
        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-2.5">Type de bien</p>
        <select
          value={search.type_local ?? ''}
          // onChange : le select ne génère qu'un événement par choix, pas de debounce nécessaire.
          onChange={e => setFilter('type_local', e.target.value)}
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
            value={search.pieces_min ?? ''}
            onChange={e => setFilter('pieces_min', e.target.value ? Number(e.target.value) : undefined)}
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
            defaultValue={search.prix_min ?? ''}
            // onBlur : même raison que pour Commune — évite un fetch à chaque frappe.
            onBlur={e => setFilter('prix_min', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Min"
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400"
          />
          <span className="text-stone-300 text-xs shrink-0">—</span>
          <input
            type="number"
            defaultValue={search.prix_max ?? ''}
            onBlur={e => setFilter('prix_max', e.target.value ? Number(e.target.value) : undefined)}
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
            defaultValue={search.surface_min ?? ''}
            onBlur={e => setFilter('surface_min', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Min"
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400"
          />
          <span className="text-stone-300 text-xs shrink-0">—</span>
          <input
            type="number"
            defaultValue={search.surface_max ?? ''}
            onBlur={e => setFilter('surface_max', e.target.value ? Number(e.target.value) : undefined)}
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
            value={search.annee_debut ?? ''}
            onChange={e => setFilter('annee_debut', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400"
          >
            <option value="">De…</option>
            {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <span className="text-stone-300 text-xs shrink-0">—</span>
          <select
            value={search.annee_fin ?? ''}
            onChange={e => setFilter('annee_fin', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400"
          >
            <option value="">À…</option>
            {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Réinitialiser — visible uniquement si au moins un filtre est actif */}
      {hasActiveFilters && (
        <button
          onClick={() => navigate({ to: '/', search: {} as never })}
          className="w-full text-xs py-1.5 rounded-lg border border-stone-200 text-stone-400 hover:border-teal-400 hover:text-teal-600 transition-colors"
        >
          Réinitialiser les filtres
        </button>
      )}

    </aside>
  )
}
