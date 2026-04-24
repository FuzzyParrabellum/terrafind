// Tests du sélecteur de tri (SortSelect).
// Miroir de TestVenteOrderingAPI côté backend.

beforeEach(() => {
  cy.intercept({ method: 'GET', pathname: '/api/ventes/stats/' }, { fixture: 'stats.json' }).as('stats')
  cy.intercept({ method: 'GET', pathname: '/api/ventes/' }, { fixture: 'ventes.json' }).as('ventes')
  cy.visit('/')
  cy.wait('@ventes')
})

describe('SortSelect — tri des résultats', () => {
  it('le tri par défaut est "date (récent → ancien)" et aucun ?ordering= dans l\'URL', () => {
    // Le tri par défaut est côté Django (-date_mutation) — on ne l\'écrit pas dans l\'URL.
    cy.url().should('not.include', 'ordering=')
    cy.get('select').contains('option', 'Date (récent → ancien)').should('exist')
  })

  it('choisir "Date (ancien → récent)" ajoute ?ordering=date_mutation', () => {
    cy.get('select').select('Date (ancien → récent)')
    cy.url().should('include', 'ordering=date_mutation')
  })

  it('choisir "Prix croissant" ajoute ?ordering=valeur_fonciere', () => {
    cy.get('select').select('Prix croissant')
    cy.url().should('include', 'ordering=valeur_fonciere')
  })

  it('choisir "Prix décroissant" ajoute ?ordering=-valeur_fonciere', () => {
    cy.get('select').select('Prix décroissant')
    cy.url().should('include', 'ordering=-valeur_fonciere')
  })

  it('changer le tri remet la pagination à zéro', () => {
    // Sans ça, l\'utilisateur resterait bloqué sur la page 3 d\'un nouveau tri
    // qui n\'a peut-être que 2 pages.
    cy.visit('/?page=3')
    cy.wait('@ventes')
    cy.get('select').select('Prix croissant')
    cy.url().should('not.include', 'page=')
    cy.url().should('include', 'ordering=valeur_fonciere')
  })

  it('changer le tri conserve les filtres actifs', () => {
    cy.visit('/?commune=Vannes&prix_max=400000')
    cy.wait('@ventes')
    cy.get('select').select('Prix croissant')
    cy.url().should('include', 'commune=Vannes')
    cy.url().should('include', 'prix_max=400000')
    cy.url().should('include', 'ordering=valeur_fonciere')
  })

  it('le select affiche le tri correspondant au paramètre URL au rechargement', () => {
    cy.visit('/?ordering=valeur_fonciere')
    cy.wait('@ventes')
    cy.get('select').should('have.value', 'valeur_fonciere')
  })
})
