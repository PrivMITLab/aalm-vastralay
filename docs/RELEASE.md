# 📦 Aalm Vastralay — Master Release Automation Guide (रिलीज़ गाइड)

> **Document Type:** Canonical DevOps Runbook for Solo Developer  
> **Tool Stack:** Google Release Please (`@v4`), GitHub Actions, Conventional Commits, Vercel Deploy Hooks  
> **Governed by:** [docs/RULES.md](file:///e:/daily/aalm-vastralay-marketplace-development%20%281%29/docs/RULES.md) (Anti-Yes-Man Principle, 100% Free Tiers)

---

## 🎯 1. Release System Ka Overview (Solo Developer Flow)

Aalm Vastralay ka release management system **100% automated aur 100% free** hai. Yeh Google ke `release-please` engine par chalta hai.

### Release Cycle Kaise Kaam Karta Hai:
1. Aap normal feature/bug-fix code likhte hain aur Conventional Commit ke sath commit karte hain (jaise: `feat(catalog): add fabric filter`).
2. Jab aap code `main` branch par push karte hain:
   - **Quality Gate** pehle chalta hai: Typecheck, Lint, 38 Test Suites, aur Next.js Build verify karta hai.
   - Code clean hone par `release-please` automatically ek draft **Release Pull Request** bana kar rakhta hai (jaise: `chore(main): release 0.1.9`).
3. Aap aur commits push karte rahenge, Release PR automatically update hota rahega aur saare naye commits ko `CHANGELOG.md` mein jodta rahega.
4. **Jab aap Release nikaalna chahein:**
   - GitHub par jakar Release PR ko **"Merge"** karein.
   - Merge hote hi `release.yml` workflow Git tag create karega, GitHub Release publish karega, Vercel production deploy trigger karega, aur Discord/Slack par message bhej dega!

---

## 🛡️ 2. Version 0.x.x Pre-Major Protection (1.0.0 Lock)

Aapka version tab tak `0.x.x` mein lock rahega jab tak aap explicitly `1.0.0` nahi trigger karte:
- `bump-minor-pre-major: true`: Naya `feat:` commit minor bump karega (`0.1.8` → `0.2.0`), kabhi 1.0.0 nahi banega.
- `bump-patch-for-minor-pre-major: true`: `fix:` ya `security:` commit patch bump karega (`0.1.8` → `0.1.9`).
- Breaking changes (`feat!:`) bhi pre-major stage mein sirf minor bump karenge.

---

## 🚀 3. Manual `v1.0.0` Launch Guide (Official Launch Day)

Jab website launch ke liye taiyar ho, `1.0.0` trigger karne ke 2 tareeqe hain:

### Option 1: Commit Footer (Recommended)
```bash
git commit -m "feat(launch): official production launch of aalm vastralay`n`nRelease-As: 1.0.0"
```

### Option 2: GitHub Actions UI (Zero Code)
1. GitHub Repo par jayein → **Actions** tab.
2. Select **"Release Please — Auto Version & Changelog"**.
3. Click **"Run workflow"** (Dropdown).
4. `release_as` box mein type karein: `1.0.0`.
5. Click **"Run workflow"**.

---

## 🔑 4. GitHub Secrets Reference (Sabhi Secrets ki Jankari)

Inhe add karne ke liye: **GitHub Repo → Settings → Secrets and variables → Actions → New repository secret**.

| Secret Name | Zaroori Hai? (Mandatory?) | Kiske Liye Hai? | Kaise Prapt Karein? (Where to Click) |
|---|---|---|---|
| **`DATABASE_URL`** | Optional (Build ke liye) | Build verification mein Neon database check ke liye | Neon Console → Dashboard → Connection String (Pooled). Agar set nahi hai toh workflow fail-safe dummy use karta hai. |
| **`VERCEL_DEPLOY_HOOK`** | Optional | Release publish hone par Vercel production build trigger karne ke liye | Vercel Dashboard → Project Settings → Git → Deploy Hooks → Create Hook. |
| **`DISCORD_WEBHOOK`** | Optional | Release hone par Discord channel mein rich embed alert ke liye | Discord Server → Channel Settings → Integrations → Webhooks → New Webhook → Copy URL. |
| **`SLACK_WEBHOOK`** | Optional | Release hone par Slack channel mein alert ke liye | Slack App Directory → Incoming Webhooks → Add to Slack → Copy Webhook URL. |

---

## ⚠️ 5. Troubleshooting & Problem Resolution (Common Errors & Fixes)

### Error 1: `Resource not accessible by integration - POST /releases`
- **Asli Wajah:** Git tag (jaise `v0.1.8`) remote par pehle se maujood hai lekin kisi doosre commit par laga hua hai. GitHub Actions ka `GITHUB_TOKEN` kisi existing tag ko overwrite nahi kar sakta.
- **Solution:**
  1. GitHub par jayein: `https://github.com/SudhirDevOps1/aalm-vastralay/releases/new`
  2. Select tag: `v0.1.8`. Title: `v0.1.8`. Click **"Publish release"**.
  3. Release publish hote hi GitHub database release-please ko satisfy kar dega aur agle run mein yeh error hamesha ke liye gayab ho jayega!

### Error 2: `Permission denied to github-actions[bot]`
- **Asli Wajah:** Repository Workflow Permissions mein Read-Only access enable hai.
- **Solution:**
  1. Repo **Settings** → **Actions** → **General**.
  2. **Workflow permissions** section mein jayein.
  3. Select **"Read and write permissions"**.
  4. Checkbox tick karein: **"Allow GitHub Actions to create and approve pull requests"**.
  5. Click **Save**.

### Error 3: Commitlint rejects valid-looking commit
- **Asli Wajah:** Type capital letter mein likha hai ya subject 10 character se chhota hai.
- **Solution:**
  - ❌ `Fix: bug` (Fails: capital 'F', length < 10)
  - ✅ `fix(checkout): resolve address selection bug` (Passes)

### Error 4: "No commits found that require a release"
- **Asli Wajah:** Saare commits `chore:`, `docs:`, ya `test:` hain, jinka version bump nahi hota.
- **Solution:** Version bump tabhi hoga jab kam se kam ek `feat:`, `fix:`, `perf:`, ya `security:` commit main branch par merge hoga.

---

## 🛡️ 6. Anti-Yes-Man Risk Matrix

| Potential Risk | Root Cause | Engineering Defense in This Architecture |
|---|---|---|
| **Accidental 1.0.0 Jump** | A developer commits `feat!:` or `BREAKING CHANGE:` | Configured `bump-minor-pre-major: true`. In pre-major state, breaking changes bump to `0.2.0`, never `1.0.0`. |
| **Release PR Merge Conflicts** | Main branch has rapid concurrent commits while Release PR is open | Release-please automatically rebases and re-generates the Release PR on every new push to main. |
| **CI Minutes Exhaustion** | Workflow running on every small typo or docs change | Configured `paths-ignore` for `**.md`, `docs/**`, and assets. Only code pushes consume CI minutes. |
| **Secret Leak in Logs** | Action printing full environment or deploy URL | All secrets injected via GitHub Secrets. Deploy hooks called silently via curl (`-s`). |
| **Broken Code Released** | Code containing type or build errors gets auto-released | The `quality-gate` job strictly gates the entire release. If typecheck, lint, 38 tests, or Next.js build fails, release-please is never executed. |
