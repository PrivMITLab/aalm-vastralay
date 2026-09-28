# 👑 Aalm Vastralay — Quality Engineering & Testing Guide
*Zero-Cost, Open-Source Automated Testing System for Solo Developers*

---

## 📐 Testing Pyramid Samajhiye (Simple Hinglish)

Testing Pyramid ek strategy hai jo batati hai ki software testing me kaunsa test kitna likhna chahiye:

1. **Base Layer (Unit Tests - Sabse Zyada & Fastest):**
   - Ye pure functions (jaise GST calculation, cart total, email validation) ko test karta hai.
   - Execution time: < 2 seconds. Memory: Very low.

2. **Middle Layer (API / Integration Tests):**
   - Next.js ke API routes ko Drizzle ORM ke mock ke saath test karta hai bina real database ko pollute kiye.

3. **Performance Layer (Load / Stress Tests):**
   - k6 engine se 100 concurrent shoppers ek sath simulate karke dekhta hai ki server crash toh nahi hota.

4. **Top Layer (E2E & Accessibility Tests - Deepest):**
   - Playwright real Chromium browser kholkar click, search aur checkout journey test karta hai.
   - `@axe-core/playwright` screen reader accessibility (WCAG 2.1 AA) verify karta hai.

---

## 🚀 Kaunsa Test Kaise Run Karein?

Terminal me direct run karne ke commands:

```powershell
# 1. Sabhi 36 Unit & Business Logic Tests:
npm test

# 2. Vitest Isolated Unit Tests:
npm run test:unit

# 3. Vitest API Integration Tests:
npm run test:api

# 4. Playwright E2E Real Browser Tests:
npm run test:e2e

# 5. Interactive Playwright UI (Visual Inspector):
npm run test:e2e:ui

# 6. Accessibility (WCAG 2.1 AA) Audit:
npm run test:a11y

# 7. Built-in Load & Stress Concurrency Test:
npm run test:load

# 8. k6 High-Load Simulation (100 Users):
k6 run tests/load/k6-load-test.js
```

---

## 🛡️ OWASP ZAP Local Pentest Guide (Zero Cost)

Apne local Next.js app par security vulnerability scan karne ke liye:

1. [OWASP ZAP Download](https://www.zaproxy.org/download/) karein (100% Free).
2. Pehle apna production build start karein:
   ```powershell
   npm run start
   ```
3. OWASP ZAP open karein -> **Automated Scan** select karein.
4. Target URL me `http://localhost:3000` enter karein aur **Attack** par click karein.
5. ZAP automated attacks simulate karega (SQL Injection, XSS, Missing Headers) aur complete PDF/HTML report generate kar dega!
