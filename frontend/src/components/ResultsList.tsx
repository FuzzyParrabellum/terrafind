import ResultCard from './ResultCard'

const RESULTS = [
  {
    address: '14 rue du Général de Gaulle',
    location: '56000 Vannes',
    saleDate: '12 mars 2024',
    type: 'Appartement' as const,
    price: '387 000 €',
    surface: '42 m²',
    pricePerSqm: '9 214 €/m²',
    rooms: '2 pièces',
    extra: '2e étage',
  },
  {
    address: '3 impasse des Korrigans',
    location: '56100 Lorient',
    saleDate: '28 fév. 2024',
    type: 'Appartement' as const,
    price: '512 000 €',
    surface: '55 m²',
    pricePerSqm: '9 309 €/m²',
    rooms: '3 pièces',
    extra: '4e étage',
  },
  {
    address: '87 avenue de la Mer',
    location: '56400 Auray',
    saleDate: '8 janv. 2024',
    type: 'Maison' as const,
    price: '1 150 000 €',
    surface: '118 m²',
    pricePerSqm: '9 745 €/m²',
    rooms: '5 pièces',
    extra: 'Terrain 60 m²',
  },
  {
    address: '22 rue des Menhirs',
    location: '56170 Quiberon',
    saleDate: '3 janv. 2024',
    type: 'Appartement' as const,
    price: '298 500 €',
    surface: '31 m²',
    pricePerSqm: '9 629 €/m²',
    rooms: '1 pièce',
    extra: '1er étage',
  },
]

export default function ResultsList() {
  return (
    <main className="flex-1 bg-stone-50 px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-400">1 247 résultats</p>
        <select className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-500 focus:outline-none focus:border-teal-400">
          <option>Trier : date (récent)</option>
          <option>Prix croissant</option>
          <option>Prix/m² croissant</option>
        </select>
      </div>

      <div className="space-y-2.5">
        {RESULTS.map((r) => (
          <ResultCard key={r.address} {...r} />
        ))}
      </div>
    </main>
  )
}
