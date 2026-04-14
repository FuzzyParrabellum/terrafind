type PropertyType = 'Appartement' | 'Maison' | 'Terrain' | 'Local commercial'

interface ResultCardProps {
  address: string
  location: string
  saleDate: string
  type: PropertyType
  price: string
  surface: string
  pricePerSqm: string
  rooms: string
  extra?: string
}

const typeBadgeClass: Record<PropertyType, string> = {
  'Appartement':       'bg-blue-50 text-blue-700',
  'Maison':            'bg-amber-50 text-amber-700',
  'Terrain':           'bg-green-50 text-green-700',
  'Local commercial':  'bg-purple-50 text-purple-700',
}

export default function ResultCard({ address, location, saleDate, type, price, surface, pricePerSqm, rooms, extra }: ResultCardProps) {
  return (
    <div className="bg-white border border-stone-100 rounded-xl px-4 py-3.5 hover:border-stone-300 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <p className="text-sm font-medium text-stone-800">
            {address}
            <span className={`ml-2 text-[11px] px-2 py-0.5 rounded-full font-normal ${typeBadgeClass[type]}`}>{type}</span>
          </p>
          <p className="text-xs text-stone-300 mt-0.5">{location} · vendu le {saleDate}</p>
        </div>
        <p className="text-base font-medium text-teal-600 ml-3 whitespace-nowrap">{price}</p>
      </div>
      <div className="flex gap-4 flex-wrap">
        <p className="text-xs text-stone-400"><span className="text-stone-700 font-medium">{surface}</span> surface</p>
        <p className="text-xs text-stone-400"><span className="text-stone-700 font-medium">{pricePerSqm}</span></p>
        <p className="text-xs text-stone-400"><span className="text-stone-700 font-medium">{rooms}</span></p>
        {extra && <p className="text-xs text-stone-400"><span className="text-stone-700 font-medium">{extra}</span></p>}
      </div>
    </div>
  )
}
