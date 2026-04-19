export default function Spinner({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <svg
        className="w-8 h-8 animate-spin text-teal-400"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-20"
          cx="12" cy="12" r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <p className="text-xs text-stone-400 tracking-wide">{label}</p>
    </div>
  )
}
