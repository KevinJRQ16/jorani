// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  timeout: 90000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html'],            // Reporte HTML estándar
    ['allure-playwright'] // Reporte Allure
  ],

  use: {
    baseURL: 'http://localhost:3000', // opcional, tu base URL
    trace: 'on-first-retry',          // recolecta trace en reintentos
    screenshot: 'only-on-failure',    // saca screenshot si falla
    video: 'retain-on-failure'        // guarda video si falla
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Puedes habilitar Firefox o Webkit si quieres
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ]
});