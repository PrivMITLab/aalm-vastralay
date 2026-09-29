# 🤝 Contributing & Conventional Commits Guide (योगदान निर्देशिका)

Swagatam! **Aalm Vastralay (आलम वस्त्रालय)** mein code contribute karne ke liye yeh simple rules follow karein. Yeh project Google ke **`release-please`** automated release system aur **Conventional Commits** standard ko use karta hai.

---

## 📌 1. Conventional Commit Format Kya Hai?

Har commit message is format mein hona chahiye:

```text
type(scope): concise subject in imperative mood

[optional body: detail explaining why this change was made]

[optional footer: BREAKING CHANGE, Closes #123, or Release-As: 1.0.0]
```

### Examples:
- ✅ `feat(cart): add 1-click upi payment button`
- ✅ `fix(auth): prevent session timeout during checkout`
- ✅ `security(headers): enforce strict csp and hsts policies`
- ❌ `added button` *(Error: commitlint ise turant reject karega!)*

---

## 🏷️ 2. Allowed Commit Types (Kaunsa Type Kab Use Karein?)

| Type | Matlab (Hinglish) | Version Impact | Changelog Section |
|---|---|---|---|
| **`feat`** | Naya feature ya functionality add ki | Minor bump (`0.1.x` → `0.2.0`) | ✨ Features |
| **`fix`** | Koi bug ya glitch theek kiya | Patch bump (`0.1.8` → `0.1.9`) | 🐛 Bug Fixes |
| **`security`** | Security hardening, encryption ya vulnerability patch | Patch bump (`0.1.8` → `0.1.9`) | 🔒 Security |
| **`perf`** | Code optimization jisse speed/latency behtar hui | Patch bump (`0.1.8` → `0.1.9`) | ⚡ Performance |
| **`refactor`** | Code restructure kiya bina feature change kiye | Koi bump nahi | ♻️ Refactoring |
| **`docs`** | Documentation ya README update kiya | Koi bump nahi | 📖 Documentation |
| **`revert`** | Purana commit revert kiya | Version rollback context | ⏪ Reverts |
| **`chore`** | Maintenance, package update, formatting | Koi bump nahi | Hidden (Clean Changelog) |
| **`test`** | Unit/Integration tests add kiye | Koi bump nahi | Hidden |
| **`ci`** | GitHub Actions workflow change kiya | Koi bump nahi | Hidden |
| **`build`** | Build configuration change ki | Koi bump nahi | Hidden |

---

## 🛡️ 3. Version 0.x.x Safety Lock (Pre-Major Protection)

- Jab tak project beta/development stage mein hai, version hamesha **`0.x.x`** range mein rahega.
- Normal semantic versioning mein `feat:` major bump kar sakti hai, lekin hamare configuration (`bump-minor-pre-major: true`) ki wajah se `feat:` sirf `0.1.x` se `0.2.0` karega, **kabhi bhi `1.0.0` nahi banega**.
- `fix:`, `perf:`, aur `security:` hamesha patch bump karenge (`0.1.8` → `0.1.9`).

---

## 🚀 4. Manual `v1.0.0` Launch Kaise Karein?

Jab aap website ko officially live launch karne ke liye ready hon, aap **2 tareeqo** se `1.0.0` trigger kar sakte hain:

### Tareeqa A: Commit Message ke Footer se
Commit message ke aakhri line par likhein:
```text
feat(core): launch official public release

Release-As: 1.0.0
```

### Tareeqa B: GitHub Actions UI se
1. GitHub repository mein **Actions** tab par jayein.
2. Left sidebar se **"Release Please — Auto Version & Changelog"** select karein.
3. Right side mein **"Run workflow"** button par click karein.
4. `Force specific version` input mein likhein: **`1.0.0`**.
5. Click **"Run workflow"**.

---

## 🔄 5. Step-by-Step Release Workflow (Kaise Kaam Karta Hai?)

```
1. Developer code push karta hai `main` branch par.
                   ⬇️
2. Quality Gate chalega:
   - Typecheck (`npm run typecheck`)
   - Linter (`npm run lint`)
   - 38 Test Suites (`npm test`)
   - Build Verification (`npm run build`)
                   ⬇️
3. Quality Gate pass hone par `release-please` automatically ek "Release PR" banata hai (jaise: `chore(main): release 0.1.9`).
                   ⬇️
4. Developer PR ke andar auto-generated CHANGELOG.md aur version bump review karta hai.
                   ⬇️
5. Developer jab PR "Merge" karta hai:
   - Git Tag auto-create hota hai (`v0.1.9`).
   - GitHub Release notes publish hoti hain.
   - Vercel deploy hook trigger hota hai (production update).
   - Team ko Discord/Slack webhook se notification chali jaati hai.
```

---

## 🪝 6. Local Quality Checks (Husky)

Commit karne se pehle local hooks automatically chalenge:
1. **`commit-msg`**: Validates conventional commit format in < 100ms.
2. **`pre-commit`**: Runs `npm run typecheck` and `npm run lint`.
Agar koi error ho, toh code commit nahi hoga, jisse aapka remote CI hamesha 100% green rahega.
