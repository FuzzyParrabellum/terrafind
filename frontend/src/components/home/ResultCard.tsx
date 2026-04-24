import type { VenteParcelle } from '../../types/api'
import { formatDate, formatPrice, formatPricePerSqm, formatRooms, formatSurface } from '../../utils/format'

interface ResultCardProps {
  vente: VenteParcelle
}

// Couleur du badge selon le type de bien.
// Le fallback gère les types inattendus renvoyés par l'API.
const BADGE_CLASSES: Record<string, string> = {
  'Appartement':                               'bg-blue-50 text-blue-700',
  'Maison':                                    'bg-amber-50 text-amber-700',
  'Terrain':                                   'bg-green-50 text-green-700',
  'Local industriel. commercial ou assimilé':  'bg-purple-50 text-purple-700',
  'Dépendance':                                'bg-stone-100 text-stone-500',
}
const BADGE_FALLBACK = 'bg-stone-100 text-stone-500'

export default function ResultCard({ vente }: ResultCardProps) {
  const pricePerSqm = formatPricePerSqm(vente.valeur_fonciere, vente.surface_bien_principal)
  const rooms = formatRooms(vente.nombre_pieces_principales)
  const types = vente.types_locaux.length > 0 ? vente.types_locaux : ['Inconnu']

  return (
    <div className="bg-white border border-stone-100 rounded-xl px-4 py-3.5 hover:border-stone-300 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
            <p className="text-sm font-medium text-stone-800">{vente.commune.nom}</p>
            {types.map((type, i) => (
              <span key={type} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-[11px] text-stone-300">+</span>}
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-normal ${BADGE_CLASSES[type] ?? BADGE_FALLBACK}`}>
                  {type}
                </span>
              </span>
            ))}
          </div>
          <p className="text-xs text-stone-300">
            {vente.code_postal} · vendu le {formatDate(vente.date_mutation)}
          </p>
        </div>
        <p className="text-base font-medium text-teal-600 ml-3 whitespace-nowrap">
          {formatPrice(vente.valeur_fonciere)}
        </p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <p className="text-xs text-stone-400">
          <span className="text-stone-700 font-medium">{formatSurface(vente.surface_bien_principal)}</span> surface
        </p>
        {pricePerSqm && (
          <p className="text-xs text-stone-400">
            <span className="text-stone-700 font-medium">{pricePerSqm}</span>
          </p>
        )}
        {rooms && (
          <p className="text-xs text-stone-400">
            <span className="text-stone-700 font-medium">{rooms}</span>
          </p>
        )}
      </div>
    </div>
  )
}
