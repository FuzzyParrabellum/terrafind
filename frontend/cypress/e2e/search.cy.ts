// Tests de la SearchBar (champ commune + boutons de type rapide).
// Miroir de TestVenteFiltersAPI côté backend pour les filtres commune et type_local.
//
// On intercepte les appels API avec cy.intercept() pour deux raisons :
//   1. Les tests ne dépendent pas du contenu réel de la base de données.
//   2. On peut vérifier les paramètres envoyés à l'API sans avoir le backend démarré.

beforeEach(() => {
  cy.intercept({ method: 'GET', pathname: '/api/ventes/stats/' }, { fixture: 'stats.json' }).as('stats')
  // pathname ignore les query params : correspond à /api/ventes/?commune=X comme à /api/ventes/
  cy.intercept({ method: 'GET', pathname: '/api/ventes/' }, { fixture: 'ventes.json' }).as('ventes')
  cy.visit('/')
  cy.wait('@ventes')
})

// ---------------------------------------------------------------------------
// Recherche par commune
// ---------------------------------------------------------------------------

describe('SearchBar — recherche par commune', () => {
  it('ajoute ?commune= à l\'URL après avoir cliqué sur Rechercher', () => {
    cy.get('input[placeholder*="Ville"]').type('Vannes')
    cy.contains('button', 'Rechercher').click()
    cy.url().should('include', 'commune=Vannes')
  })

  it('soumet la commune avec la touche Entrée', () => {
    cy.get('input[placeholder*="Ville"]').type('Lorient{enter}')
    cy.url().should('include', 'commune=Lorient')
  })

  it('supprime ?commune= si le champ est vidé avant soumission', () => {
    cy.visit('/?commune=Vannes')
    cy.get('input[placeholder*="Ville"]').clear()
    cy.contains('button', 'Rechercher').click()
    cy.url().should('not.include', 'commune=')
  })

  it('remet la pagination à zéro quand on soumet une nouvelle commune', () => {
    cy.visit('/?commune=Vannes&page=3')
    cy.get('input[placeholder*="Ville"]').clear().type('Lorient')
    cy.contains('button', 'Rechercher').click()
    cy.url().should('not.include', 'page=')
  })
})

// ---------------------------------------------------------------------------
// Filtres rapides par type (boutons sous la barre de recherche)
// ---------------------------------------------------------------------------

describe('SearchBar — filtres rapides par type', () => {
  it('ajoute ?type_local=Maison à l\'URL', () => {
    cy.contains('button', 'Maison').click()
    cy.url().should('include', 'type_local=Maison')
  })

  it('ajoute ?type_local=Appartement à l\'URL', () => {
    cy.contains('button', 'Appartement').click()
    cy.url().should('include', 'type_local=Appartement')
  })

  it('cliquer sur "Tous types" supprime type_local de l\'URL', () => {
    cy.visit('/?type_local=Maison')
    cy.contains('button', 'Tous types').click()
    cy.url().should('not.include', 'type_local=')
  })

  it('le bouton du type actif est mis en évidence', () => {
    cy.contains('button', 'Maison').click()
    // La classe active inclut bg-teal-50, contrairement aux boutons inactifs.
    cy.contains('button', 'Maison').should('have.class', 'bg-teal-50')
    cy.contains('button', 'Appartement').should('not.have.class', 'bg-teal-50')
  })

  it('changer de type remet la pagination à zéro', () => {
    cy.visit('/?type_local=Maison&page=2')
    cy.contains('button', 'Appartement').click()
    cy.url().should('not.include', 'page=')
  })
})
