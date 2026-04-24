export default function Footer() {
  return (
    <footer className="border-t border-stone-100 bg-white px-6 py-4 text-center">
      <p className="text-[11px] text-stone-400">
        Données : jeu de données {' '}
        <span className="italic">« Demandes de valeurs foncières »</span>
        , publié par la Direction générale des finances publiques (DGFiP) —{' '}
        <a
          href="https://alliance.numerique.gouv.fr/licence-ouverte-open-licence/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-teal-600 transition-colors"
        >
          Licence Ouverte / Open Licence
        </a>
      </p>
    </footer>
  )
}
