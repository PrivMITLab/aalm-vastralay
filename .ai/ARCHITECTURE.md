# 🏛️ AALM VASTRALAY — ARCHITECTURE DESIGN DOCUMENT
# Location: .ai/ARCHITECTURE.md

## 1. High-Level System Architecture

```mermaid
flowchart TD
    Client["Shopper / Seller / Admin Browser"] --> Cloudflare["Edge / CDN / Cloudflare"]
    Cloudflare --> NextApp["Next.js 16 (App Router + Server Actions)"]
    
    subgraph Server_Tier["Next.js Server & Application Tier"]
        NextApp --> AuthEngine["Auth Engine (Scrypt + JWT / Clerk)"]
        NextApp --> SecurityGuard["Security Guard (Rate Limit + Audit + CSRF)"]
        NextApp --> SettingsEngine["Zero-Code Settings Engine"]
        NextApp --> ActionsEngine["Server Actions (Commerce, Seller, Admin)"]
    end
    
    subgraph Data_Tier["Data & Storage Tier"]
        ActionsEngine --> DrizzleORM["Drizzle ORM (Type-safe SQL)"]
        DrizzleORM --> NeonPostgres["Neon Serverless PostgreSQL (16 Tables)"]
        NextApp --> EncryptionEngine["AES-256-GCM Encryption Engine"]
        NextApp --> LocalStorage["Local / Cloud Uploads (/public/uploads)"]
    end
```

## 2. Component Layers & Responsibility

### Layer 1: Presentation & UI (`src/components/` & `src/app/`)
- **Server Components:** Fetch data directly via Drizzle queries with zero client bundle footprint.
- **Client Components (`"use client"`):** Used only for interactive states (drawers, carousels, forms, live filtering).
- **Styling:** Tailwind CSS with CSS Variables (`var(--brand)`, `var(--accent)`, `var(--surface)`) supporting live admin customization and dark mode.

### Layer 2: Business Logic & Server Actions (`src/actions/`)
- Pure server-side validation using **Zod**.
- Transactional state updates with audit logging (`recordAudit`).
- Cache invalidation (`revalidatePath`) for instant UI synchronization.

### Layer 3: Security & Privacy (`src/lib/security/`, `src/lib/encryption.ts`)
- Cryptographic hashing of user passwords with Scrypt.
- Authenticated AES-256-GCM cipher for database credential protection.
- In-memory and database rate-limiting for brute-force mitigation.
- Tenant isolation ensuring sellers only access their own store data.

### Layer 4: Persistence & Database (`src/db/`)
- Drizzle ORM schemas (`src/db/schema.ts`) defining 16 strongly-typed tables.
- Zero-touch bootstrap (`src/db/init.ts`) ensuring automatic table and index creation on startup.
- Safe database reset mechanisms preserving core catalog and settings.
