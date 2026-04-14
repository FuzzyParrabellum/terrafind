export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-stone-100">
      <a href="/" className="text-[15px] font-medium tracking-tight">
        <span className="text-white bg-stone-900 px-1 rounded-sm">morbi</span>
        <span className="text-teal-600">parcelle</span>
      </a>
      <div className="hidden md:flex items-center gap-6">
        <a href="#" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Explorer</a>
        <a href="#" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Statistiques</a>
        <a href="#" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">À propos</a>
      </div>
      <button className="text-sm px-3.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors">
        Connexion
      </button>
    </nav>
  )
}
