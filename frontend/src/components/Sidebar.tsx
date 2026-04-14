export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-stone-100 px-4 py-5 space-y-6">

      <div>
        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-2.5">Prix de vente</p>
        <div className="flex items-center gap-2 mb-1.5">
          <input type="number" defaultValue={150000} className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400" />
          <span className="text-stone-300 text-xs shrink-0">—</span>
          <input type="number" defaultValue={900000} className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400" />
        </div>
        <p className="text-[11px] text-stone-300">en euros</p>
      </div>

      <div>
        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-2.5">Surface</p>
        <div className="flex items-center gap-2 mb-1.5">
          <input type="number" defaultValue={20} className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400" />
          <span className="text-stone-300 text-xs shrink-0">—</span>
          <input type="number" defaultValue={200} className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 focus:outline-none focus:border-teal-400" />
        </div>
        <p className="text-[11px] text-stone-300">en m²</p>
      </div>

      <div>
        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-2.5">Période</p>
        <div className="space-y-2">
          {['2024', '2023'].map(year => (
            <label key={year} className="flex items-center gap-2 text-sm text-stone-500 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-teal-400" /> {year}
            </label>
          ))}
          {['2022', '2021', '2020 et avant'].map(year => (
            <label key={year} className="flex items-center gap-2 text-sm text-stone-500 cursor-pointer">
              <input type="checkbox" className="accent-teal-400" /> {year}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wider mb-2.5">Pièces</p>
        <div className="space-y-2">
          {['Studio / T1'].map(label => (
            <label key={label} className="flex items-center gap-2 text-sm text-stone-500 cursor-pointer">
              <input type="checkbox" className="accent-teal-400" /> {label}
            </label>
          ))}
          {['T2', 'T3'].map(label => (
            <label key={label} className="flex items-center gap-2 text-sm text-stone-500 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-teal-400" /> {label}
            </label>
          ))}
          {['T4 et plus'].map(label => (
            <label key={label} className="flex items-center gap-2 text-sm text-stone-500 cursor-pointer">
              <input type="checkbox" className="accent-teal-400" /> {label}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-stone-100 bg-stone-50 h-40 flex items-center justify-center">
        <span className="text-xs text-stone-300">Carte interactive</span>
      </div>

    </aside>
  )
}
