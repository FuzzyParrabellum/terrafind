import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // L'app Vite tourne sur ce port en dev (docker-compose expose 5173:5173).
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    // Délai avant d'abandonner une assertion — augmenté pour les envs lents.
    defaultCommandTimeout: 6000,
  },
})
