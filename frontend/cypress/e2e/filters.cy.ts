// Tests des filtres de la Sidebar.
// Miroir de TestVenteFiltersAPI côté backend :
// prix_min/max, surface_min/max, pieces_min, annee_debut/fin, réinitialisation.
//
// Logique de la Sidebar : les filtres sont en état LOCAL jusqu'au clic sur
// "Appliquer les filtres". On vérifie donc l'URL après ce clic, pas après chaque frappe.

beforeEach(() => {
  cy.intercept({ method: 'GET', pathname: '/api/ventes/stats/' }, { fixture: 'stats.json' }).as('stats')
  cy.intercept({ method: 'GET', pathname: '/api/ventes/' }, { fixture: 'ventes.json' }).as('ventes')
  cy.visit('/')
  cy.wait('@ventes')
})

// ---------------------------------------------------------------------------
// Commune (dans la sidebar)
// ---------------------------------------------------------------------------

describe('Sidebar — filtre commune', () => {
  it('ajoute ?commune= à l\'URL après "Appliquer les filtres"', () => {
    cy.get('aside input[placeholder*="Vannes"]').type('Lorient')
    cy.contains('button', 'Appliquer').click()
    cy.url().should('include', 'commune=Lorient')
  })

  it('ne modifie pas l\'URL tant que le bouton n\'est pas cliqué', () => {
    cy.get('aside input[placeholder*="Vannes"]').type('Lorient')
    cy.url().should('not.include', 'commune=')
  })
})

// ---------------------------------------------------------------------------
// Type de bien
// ---------------------------------------------------------------------------

describe('Sidebar — filtre type de bien', () => {
  it('ajoute ?type_local=Maison à l\'URL', () => {
    cy.get('aside select').first().select('Maison')
    cy.contains('button', 'Appliquer').click()
    cy.url().should('include', 'type_local=Maison')
  })

  it('le filtre Pièces est masqué par défaut', () => {
    cy.get('aside').contains('Pièces').should('not.exist')
  })

  it('le filtre Pièces apparaît quand on sélectionne Maison', () => {
    cy.get('aside select').first().select('Maison')
    cy.get('aside').contains('Pièces').should('exist')
  })

  it('le filtre Pièces apparaît quand on sélectionne Appartement', () => {
    cy.get('aside select').first().select('Appartement')
    cy.get('aside').contains('Pièces').should('exist')
  })

  it('le filtre Pièces disparaît si on repasse sur un type sans pièces', () => {
    cy.get('aside select').first().select('Maison')
    cy.get('aside').contains('Pièces').should('exist')
    cy.get('aside select').first().select('Dépendance')
    cy.get('aside').contains('Pièces').should('not.exist')
  })
})

// ---------------------------------------------------------------------------
// Prix
// ---------------------------------------------------------------------------

describe('Sidebar — filtre prix', () => {
  it('ajoute ?prix_min= à l\'URL', () => {
    // Le premier bloc Min/Max de la sidebar est celui du Prix.
    cy.get('aside input[placeholder="Min"]').first().type('100000')
    cy.contains('button', 'Appliquer').click()
    cy.url().should('include', 'prix_min=100000')
  })

  it('ajoute ?prix_max= à l\'URL', () => {
    cy.get('aside input[placeholder="Max"]').first().type('500000')
    cy.contains('button', 'Appliquer').click()
    cy.url().should('include', 'prix_max=500000')
  })

  it('ajoute les deux bornes de prix à l\'URL', () => {
    cy.get('aside input[placeholder="Min"]').first().type('100000')
    cy.get('aside input[placeholder="Max"]').first().type('500000')
    cy.contains('button', 'Appliquer').click()
    cy.url().should('include', 'prix_min=100000')
    cy.url().should('include', 'prix_max=500000')
  })
})

// ---------------------------------------------------------------------------
// Surface
// ---------------------------------------------------------------------------

describe('Sidebar — filtre surface', () => {
  it('ajoute ?surface_min= à l\'URL', () => {
    // Le deuxième bloc Min/Max est celui de la Surface.
    cy.get('aside input[placeholder="Min"]').eq(1).type('50')
    cy.contains('button', 'Appliquer').click()
    cy.url().should('include', 'surface_min=50')
  })

  it('ajoute ?surface_max= à l\'URL', () => {
    cy.get('aside input[placeholder="Max"]').eq(1).type('200')
    cy.contains('button', 'Appliquer').click()
    cy.url().should('include', 'surface_max=200')
  })
})

// ---------------------------------------------------------------------------
// Période
// ---------------------------------------------------------------------------

describe('Sidebar — filtre période', () => {
  it('ajoute ?annee_debut= à l\'URL', () => {
    cy.get('aside select').contains('option', 'De…').parent().select('2022')
    cy.contains('button', 'Appliquer').click()
    cy.url().should('include', 'annee_debut=2022')
  })

  it('ajoute ?annee_fin= à l\'URL', () => {
    cy.get('aside select').contains('option', 'À…').parent().select('2024')
    cy.contains('button', 'Appliquer').click()
    cy.url().should('include', 'annee_fin=2024')
  })
})

// ---------------------------------------------------------------------------
// Bouton Réinitialiser
// ---------------------------------------------------------------------------

describe('Sidebar — réinitialisation', () => {
  it('le bouton Réinitialiser est absent quand aucun filtre n\'est rempli', () => {
    cy.contains('button', 'Réinitialiser').should('not.exist')
  })

  it('le bouton Réinitialiser apparaît dès qu\'un filtre local est rempli', () => {
    cy.get('aside input[placeholder*="Vannes"]').type('Vannes')
    cy.contains('button', 'Réinitialiser').should('exist')
  })

  it('réinitialiser vide l\'URL et les champs', () => {
    cy.visit('/?commune=Vannes&prix_min=100000')
    cy.wait('@ventes')
    cy.contains('button', 'Réinitialiser').click()
    cy.url().should('not.include', 'commune=')
    cy.url().should('not.include', 'prix_min=')
    cy.get('aside input[placeholder*="Vannes"]').should('have.value', '')
  })

  it('réinitialiser conserve le tri actif', () => {
    cy.visit('/?commune=Vannes&ordering=valeur_fonciere')
    cy.wait('@ventes')
    cy.contains('button', 'Réinitialiser').click()
    cy.url().should('include', 'ordering=valeur_fonciere')
    cy.url().should('not.include', 'commune=')
  })

  it('appliquer remet la pagination à zéro', () => {
    cy.visit('/?page=3')
    cy.wait('@ventes')
    cy.get('aside input[placeholder*="Vannes"]').type('Vannes')
    cy.contains('button', 'Appliquer').click()
    cy.url().should('not.include', 'page=')
  })
})
