import { Link } from '@tanstack/react-router'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-stone-100">
      <Link to="/" search={p => p} className="text-[15px] font-medium tracking-tight">
        <span className="text-white bg-stone-900 px-1 rounded-sm">morbi</span>
        <span className="text-teal-600">parcelle</span>
      </Link>
      <div className="hidden md:flex items-center gap-6">
        <Link
          to="/"
          search={p => p}
          className="text-sm text-stone-500 hover:text-stone-800 transition-colors [&.active]:text-stone-900 [&.active]:font-medium"
        >
          Explorer
        </Link>
        <Link
          to="/stats"
          className="text-sm text-stone-500 hover:text-stone-800 transition-colors [&.active]:text-stone-900 [&.active]:font-medium"
        >
          Statistiques
        </Link>
        <a href="#" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Comparer des communes</a>
      </div>
    </nav>
  )
}
