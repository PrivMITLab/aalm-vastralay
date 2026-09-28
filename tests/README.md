# 👑 Aalm Vastralay — Quality Engineering & Testing Guide
*Zero-Cost, Open-Source Automated Testing System for Solo Developers*

---

## 📐 Testing Pyramid Samajhiye (Simple Hinglish)

Testing Pyramid ek quality strategy hai jo batati hai ki software development me kaunsa test kitna likhna chahiye:

1. **Base Layer (Unit Tests - Sabse Fast & Zyada):**
   - Pure functions (jaise GST calculation, cart total, email validation) ko in-memory test karta hai.
   - Speed: < 500ms. Cost: ₹0.

2. **Integration & Database Layer (API & Neon DB Tests):**
   - API endpoints ko Drizzle ORM ke saath test karta hai. Real database operations (insert, select, delete) Neon test branch par verify hoti hain.

3. **Performance Layer (Load & Stress Tests):**
   - Built-in concurrent runners aur k6 engine se 100 simultaneous virtual users ka stress test karta hai.

4. **Top Layer (E2E, Visual & Accessibility Tests):**
   - Playwright real Chromium browser me poora checkout flow test karta hai.
   - Visual Regression snapshots se unintentional CSS/UI bugs pakde jaate hain.
   - `@axe-core/playwright` WCAG 2.1 AA accessibility standards verify karta hai.

5. **Security Layer (OWASP ZAP Dynamic Pentest & CodeQL):**
   - Running application par automated attack simulation karke injection, XSS aur missing headers scan karta hai.

---

## 🚀 Kaunsa Test Kaise Run Karein?

Terminal me direct run karne ke commands:

```powershell
# 1. Sabhi 36 Enterprise Business & Security Suites:
npm test

# 2. Vitest Isolated Unit Tests:
npm run test:unit

# 3. Vitest API Integration Tests:
npm run test:api

# 4. Drizzle Database Integration Test (Neon Test Branch):
npm run test:db

# 5. V8 Test Coverage Report:
npm run test:coverage

# 6. Playwright E2E Storefront Journey:
npm run test:e2e

# 7. Playwright Visual Regression Snapshots:
npm run test:visual

# 8. Visual Snapshots Update (Design change hone par baseline update karein):
npm run test:visual:update

# 9. Accessibility (WCAG 2.1 AA) Audit:
npm run test:a11y

# 10. Concurrency Load & Stress Test:
npm run test:load

# 11. k6 High-Load 100-User Simulation:
npm run test:k6
```

---

## 🌿 Neon Test Database Branch Setup Guide

Agar aap testing ko production data se 100% isolate rakhna chahte hain:

1. [Neon Console](https://console.neon.tech) me login karein aur apna **Aalm Vastralay** project select karein.
2. Left sidebar me **Branches** par click karein -> **Create Branch** button dabayein.
3. Branch Name me `test-ci` ya `staging` likhein. Base branch `main` select karein (Neon instant zero-cost copy-on-write branch bana deta hai).
4. `Connection Details` se `postgres://...-pooler...` connection string copy karein.
5. GitHub Repository me jayein:
   - **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
   - Name: `DATABASE_URL`
   - Value: Neon test branch ka connection string paste karein.
6. Ab CI pipeline automatically test branch use karegi aur production database 100% safe rahega!

---

## 📸 Visual Regression (Playwright Snapshots) Workflow

Jab aap design ya CSS intentionally change karte hain:
1. Agar aapne header, button, ya typography update ki hai toh visual test baseline difference ki wajah se fail hoga.
2. Baseline image update karne ke liye ye command chalayein:
   ```powershell
   npm run test:visual:update
   ```
3. Naye golden images save ho jayenge aur future test runs unhi se compare karenge.

---

## 🛡️ OWASP ZAP Dynamic Security Scan (DAST)

GitHub Actions CI me `.github/workflows/ci.yml` automatic baseline scanner run karta hai:
- Background me local production build start karta hai (`http://localhost:3000`).
- `zaproxy/action-baseline@v0.14.0` automated attack simulation run karta hai (Zero Vercel quota used).
- Agar local machine par manually test karna ho toh:
  1. [OWASP ZAP Download](https://www.zaproxy.org/download/) karein.
  2. `npm run start` se app start karein.
  3. ZAP me target `http://localhost:3000` dekar **Attack** click karein.
