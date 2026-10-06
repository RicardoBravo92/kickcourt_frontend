# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> Landing Page / Court Listing >> should display court catalog section
- Location: e2e\landing.spec.ts:13:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h2:has-text("Catálogo")')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('h2:has-text("Catálogo")') with timeout 5000ms
  - waiting for locator('h2:has-text("Catálogo")')

```

```yaml
- navigation:
  - link "KickCourt":
    - /url: /courts
  - link "Canchas":
    - /url: /courts
  - button "EN"
  - link "Iniciar Sesión":
    - /url: /login
  - link "Registrarse":
    - /url: /register
- main:
  - text: Plataforma de Reservas Deportivas
  - heading "Reserva tu cancha en segundos" [level=1]
  - paragraph: Encuentra, compara y reserva canchas deportivas cerca de ti. Rápido, fácil y seguro.
  - button "⚽ Explorar Canchas"
  - link "Cómo funciona":
    - /url: "#how-it-works"
  - paragraph: "0"
  - paragraph: Canchas
  - paragraph: Reservas
  - paragraph: Realizadas
  - paragraph: 99.8%
  - paragraph: Satisfacción
  - heading "Cómo funciona" [level=2]
  - paragraph: Tres pasos simples para reservar tu cancha
  - text: 🔍
  - heading "Buscar" [level=3]
  - paragraph: Explora las canchas disponibles, filtra por deporte, superficie y precio.
  - text: 📅
  - heading "Elegir" [level=3]
  - paragraph: Selecciona la fecha y hora que mejor te convenga.
  - text: 🏆
  - heading "Reservar" [level=3]
  - paragraph: Confirma tu reserva y recibe confirmación instantánea.
  - heading "¿Por qué KickCourt?" [level=2]
  - paragraph: La mejor forma de reservar canchas deportivas
  - text: ⚡
  - heading "Rápido y Fácil" [level=4]
  - paragraph: Reserva en menos de 30 segundos
  - text: 💡
  - heading "Mejores Precios" [level=4]
  - paragraph: Compara precios y encuentra la mejor oferta
  - text: 📱
  - heading "Confirmación Instantánea" [level=4]
  - paragraph: Recibe tu confirmación de reserva al instante
  - heading "Canchas Disponibles" [level=2]
  - paragraph: Encuentra la cancha perfecta para tu juego
  - text: 0 fields.totalResults fields.sport
  - combobox:
    - option "Todos" [selected]
    - option "Fútbol"
    - option "Pádel"
    - option "Tenis"
    - option "Básquet"
    - option "Vóley"
    - option "Hockey"
  - text: Superficie
  - combobox:
    - option "Todas" [selected]
    - option "Sintético"
    - option "Natural"
    - option "Indoor"
    - option "Polvo de ladrillo"
    - option "Césped"
    - option "Dura"
    - option "Madera"
    - option "Arena"
  - text: Nombre
  - textbox "Buscar canchas..."
  - button "Buscar"
  - button "Limpiar"
  - paragraph: Cargando canchas...
  - heading "Preguntas Frecuentes" [level=2]
  - paragraph: Todo lo que necesitas saber
  - button "¿Cómo reservo una cancha? ▾"
  - button "¿Puedo cancelar mi reserva? ▾"
  - button "¿Qué métodos de pago se aceptan? ▾"
  - heading "¿Listo para jugar?" [level=2]
  - paragraph: Únete a miles de jugadores que ya reservan sus canchas con KickCourt
  - link "Regístrate Gratis":
    - /url: /register
  - button "Explorar Canchas"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Landing Page / Court Listing', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |   });
  7  | 
  8  |   test('should load landing page with hero section', async ({ page }) => {
  9  |     await expect(page.locator('h1')).toContainText(/KickCourt|Reserva tu cancha/i);
  10 |     await expect(page.locator('button:has-text("Explorar canchas")').first()).toBeVisible();
  11 |   });
  12 | 
  13 |   test('should display court catalog section', async ({ page }) => {
  14 |     await expect(page.locator('#catalog-section')).toBeVisible();
> 15 |     await expect(page.locator('h2:has-text("Catálogo")')).toBeVisible();
     |                                                           ^ Error: expect(locator).toBeVisible() failed
  16 |   });
  17 | 
  18 |   test('should filter courts by sport type', async ({ page }) => {
  19 |     await page.selectOption('select[id="sport_type"], select[name="sport_type"]', 'FOOTBALL');
  20 |     await page.click('button:has-text("Buscar")');
  21 |     await expect(page.locator('#catalog-section')).toBeVisible();
  22 |   });
  23 | 
  24 |   test('should filter courts by surface type', async ({ page }) => {
  25 |     await page.selectOption('select[id="surface"], select[name="surface"]', 'SYNTHETIC');
  26 |     await page.click('button:has-text("Buscar")');
  27 |     await expect(page.locator('#catalog-section')).toBeVisible();
  28 |   });
  29 | 
  30 |   test('should search courts by name', async ({ page }) => {
  31 |     await page.fill('input[placeholder*="Buscar"], input[name="search"]', 'futbol');
  32 |     await page.click('button:has-text("Buscar")');
  33 |     await expect(page.locator('#catalog-section')).toBeVisible();
  34 |   });
  35 | 
  36 |   test('should clear filters', async ({ page }) => {
  37 |     await page.selectOption('select[id="sport_type"], select[name="sport_type"]', 'FOOTBALL');
  38 |     await page.click('button:has-text("Limpiar")');
  39 |     await expect(page.locator('select[id="sport_type"], select[name="sport_type"]')).toHaveValue('');
  40 |   });
  41 | 
  42 |   test('should display court cards with details', async ({ page }) => {
  43 |     await expect(page.locator('#catalog-section .grid')).toBeVisible();
  44 |   });
  45 | 
  46 |   test('should navigate to court detail on click', async ({ page }) => {
  47 |     const firstCourtLink = page.locator('a[href^="/courts/"]').first();
  48 |     await expect(firstCourtLink).toBeVisible();
  49 |     await firstCourtLink.click();
  50 |     await expect(page).toHaveURL(/\/courts\/\d+/);
  51 |   });
  52 | 
  53 |   test('should display FAQ section', async ({ page }) => {
  54 |     await expect(page.locator('h2:has-text("Preguntas")')).toBeVisible();
  55 |   });
  56 | 
  57 |   test('should toggle FAQ items', async ({ page }) => {
  58 |     const faqButton = page.locator('button:has-text("¿Cómo reservo")').first();
  59 |     if (await faqButton.isVisible()) {
  60 |       await faqButton.click();
  61 |       await expect(page.locator('text=Selecciona la cancha')).toBeVisible();
  62 |     }
  63 |   });
  64 | 
  65 |   test('should display CTA section', async ({ page }) => {
  66 |     await expect(page.locator('h2:has-text("Listo para jugar")')).toBeVisible();
  67 |   });
  68 | 
  69 |   test('should navigate to register from CTA', async ({ page }) => {
  70 |     await page.click('a:has-text("Regístrate")');
  71 |     await expect(page).toHaveURL(/\/register/);
  72 |   });
  73 | });
```