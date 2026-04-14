export default function Hero() {
  return (
    <section className="px-6 pt-14 pb-10 text-center bg-white border-b border-stone-100">
      <h1 className="text-[28px] font-medium leading-tight tracking-tight mb-2.5">
        Prix de vente réels<br />des biens immobiliers en France
      </h1>
      <p className="text-sm text-stone-400 mb-7">
        70 millions de transactions issues des données DVF officielles — de 2018 à aujourd'hui
      </p>

      <div className="flex items-center gap-2 max-w-xl mx-auto bg-white border border-stone-200 rounded-xl px-3 py-2 mb-4 focus-within:border-teal-400 transition-colors">
        <svg className="shrink-0 text-stone-300" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          defaultValue="Vannes"
          placeholder="Ville, code postal, adresse…"
          className="flex-1 bg-transparent text-sm text-stone-800 placeholder-stone-300 outline-none"
        />
        <button className="px-4 py-1.5 rounded-lg bg-teal-400 hover:bg-teal-600 text-teal-900 text-sm font-medium transition-colors whitespace-nowrap">
          Rechercher
        </button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button className="px-3 py-1 rounded-full text-xs border border-teal-400 bg-teal-50 text-teal-800 font-medium">Tous types</button>
        <button className="px-3 py-1 rounded-full text-xs border border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 transition-colors">Appartement</button>
        <button className="px-3 py-1 rounded-full text-xs border border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 transition-colors">Maison</button>
        <button className="px-3 py-1 rounded-full text-xs border border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 transition-colors">Terrain</button>
        <button className="px-3 py-1 rounded-full text-xs border border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 transition-colors">Local commercial</button>
      </div>
    </section>
  )
}
