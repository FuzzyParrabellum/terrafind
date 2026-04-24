// Tests du widget de pagination.
// Miroir de TestVentePaginationAPI côté backend.
//
// On utilise deux fixtures :
//   - ventes.json  : count=42 (>PAGE_SIZE=20), 2 résultats, next != null
//   - ventes-p2.json: count=42, 2 résultats, previous != null, next=null (dernière page)

const ventesDernierePage = {
  count: 42,
  next: null,
  previous: 'http://localhost:5173/api/ventes/?page=2',
  results: [
    {
      public_id: '550e8400-e29b-41d4-a716-446655440099',
      commune: { code_insee: '56260', nom: 'Vannes', code_departement: '56' },
      code_postal: '56000',
      date_mutation: '2021-05-10',
      nature_mutation: 'Vente',
      valeur_fonciere: '150000.00',
      types_locaux: ['Maison'],
      surface_bien_principal: 60,
      surface_totale: 60,
      nombre_pieces_principales: 3,
      nature_culture: null,
      surface_terrain: null,
    },
  ],
}

beforeEach(() => {
  cy.intercept({ method: 'GET', pathname: '/api/ventes/stats/' }, { fixture: 'stats.json' }).as('stats')
  cy.intercept({ method: 'GET', pathname: '/api/ventes/' }, { fixture: 'ventes.json' }).as('ventes')
  cy.visit('/')
  cy.wait('@ventes')
})

describe('Pagination — navigation', () => {
  it('affiche le widget quand il y a plus d\'une page de résultats', () => {
    // count=42 > PAGE_SIZE=20 → le widget doit être présent.
    cy.get('[data-cy=pagination]').should('exist')
  })

  it('la page 1 est active par défaut', () => {
    cy.get('[data-cy=pagination]').contains('button', '1').should('have.class', 'bg-teal-400')
  })

  it('cliquer sur la page 2 ajoute ?page=2 à l\'URL', () => {
    cy.get('[data-cy=pagination]').contains('button', '2').click()
    cy.url().should('include', 'page=2')
  })

  it('la page 1 n\'a pas de paramètre ?page= dans l\'URL', () => {
    // ?page=1 est implicite → on ne l\'écrit pas dans l\'URL pour rester propre.
    cy.url().should('not.include', 'page=')
  })

  it('le bouton ← est désactivé sur la première page', () => {
    cy.get('[data-cy=pagination]').find('button').first().should('be.disabled')
  })

  it('le bouton → est désactivé sur la dernière page', () => {
    // On simule d\'être sur la dernière page en interceptant avec next=null.
    cy.intercept({ method: 'GET', pathname: '/api/ventes/' }, ventesDernierePage).as('ventesDerniere')
    cy.visit('/?page=3')
    cy.wait('@ventesDerniere')
    cy.get('[data-cy=pagination]').find('button').last().should('be.disabled')
  })

  it('le bouton → navigue vers la page suivante', () => {
    cy.get('[data-cy=pagination]').find('button').last().click()
    cy.url().should('include', 'page=2')
  })

  it('cliquer sur ← depuis la page 2 revient à la page 1 sans ?page= dans l\'URL', () => {
    cy.intercept({ method: 'GET', pathname: '/api/ventes/' }, ventesDernierePage).as('ventesDerniere')
    cy.visit('/?page=2')
    cy.wait('@ventesDerniere')
    cy.get('[data-cy=pagination]').find('button').first().click()
    cy.url().should('not.include', 'page=')
  })
})

describe('Pagination — ellipsis', () => {
  it('affiche des "…" quand il y a beaucoup de pages', () => {
    // count=42 → ceil(42/20)=3 pages → pas d\'ellipsis (trop peu de pages).
    // Pour tester les ellipsis on a besoin d\'un count élevé.
    cy.intercept({ method: 'GET', pathname: '/api/ventes/' }, {
      count: 5000, next: '/api/ventes/?page=2', previous: null, results: [],
    }).as('ventesMany')
    cy.visit('/')
    cy.wait('@ventesMany')
    cy.get('[data-cy=pagination]').contains('…').should('exist')
  })

  it('n\'affiche pas le widget si les résultats tiennent sur une page', () => {
    cy.intercept({ method: 'GET', pathname: '/api/ventes/' }, {
      count: 5, next: null, previous: null, results: [],
    }).as('ventesFew')
    cy.visit('/')
    cy.wait('@ventesFew')
    cy.get('[data-cy=pagination]').should('not.exist')
  })
})
