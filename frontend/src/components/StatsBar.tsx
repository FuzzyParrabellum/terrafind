export default function StatsBar() {
  return (
    <div className="grid grid-cols-3 divide-x divide-stone-100 border-b border-stone-100 bg-white">
      <div className="px-6 py-4 text-center">
        <p className="text-xl font-medium text-stone-900">8 742</p>
        <p className="text-[11px] text-stone-400 mt-0.5">Ventes dans le Morbihan</p>
      </div>
      <div className="px-6 py-4 text-center">
        <p className="text-xl font-medium text-stone-900">9 840 €/m²</p>
        <p className="text-[11px] text-stone-400 mt-0.5">Prix médian</p>
      </div>
      <div className="px-6 py-4 text-center">
        <p className="text-xl font-medium text-teal-600">+3,2 %</p>
        <p className="text-[11px] text-stone-400 mt-0.5">Évolution sur 12 mois</p>
      </div>
    </div>
  )
}
