# 📋 AALM VASTRALAY — PRODUCT REQUIREMENTS DOCUMENT (PRD)
# Location: .ai/PRD.md

## 1. Product Vision & Target Audience
- **Vision:** Bihar and India's premier ethnic wear marketplace connecting traditional artisans, weavers, and local sellers in Kalyanipur/Bihar with buyers across India.
- **Target Audience:**
  - **Shoppers:** Families shopping for weddings (Bridal Lehengas, Sherwanis), festivals (Chhath Puja, Diwali, Eid, Durga Puja), and everyday ethnic wear.
  - **Sellers:** Ethnic apparel weavers, boutique owners, and fabric merchants wanting an easy portal with zero upfront fees.
  - **Admin:** Proprietor (Suheb Alam) having total oversight and live customization control without code modifications.

## 2. Core Functional Requirements

### 🛍️ Shopper Experience:
- **Instant Search & Autocomplete:** Real-time search with occasion and category filtering.
- **Bihar & Indian Festive Hub:** Dedicated occasion curation (Chhath, Diwali, Eid, Wedding, Sangeet).
- **Product Details & Sizing:** Rich image gallery, color swatches, size ranking (XS to XXL, Free Size), fabric care, and weight.
- **Interactive Cart & Checkout:** COD and UPI support, delivery pin code validation, discount coupons (`WELCOME10`), free shipping tracker (₹999).
- **Direct WhatsApp Inquiry:** One-click WhatsApp button with pre-filled product title and price for direct shop communication.

### 🏬 Multi-Vendor Seller Portal (`/seller`):
- **Store Setup:** Custom store name, logo, banner, Bihar address, and optional GSTIN.
- **Catalog Management (CRUD):** Add products with variants (size, color, stock adjustment, SKU), edit listings, toggle visibility, and safe deletion.
- **Order Management:** View orders placed for the seller's store, update dispatch status (processing, shipped, delivered), and enter courier tracking number.
- **Tenant Privacy Isolation:** Seller cannot view or alter other sellers' inventory or sales.

### 👑 Admin Control Suite (`/admin`):
- **Live Site Settings (`/admin/settings`):** 93 zero-code configurations for brand name, logo, announcement marquee, hero banner slides, CTA buttons, theme palette, and payment settings.
- **Audit Logging (`/admin/security`):** Complete immutable security log of every administrative edit with actor email and IP.
- **Integrations & Diagnostics (`/admin/integrations`):** Live database health check, table counts, and safe demo clean wiping.

## 3. Non-Functional Requirements
- **Performance:** Sub-1.5s First Contentful Paint, Next.js 16 Turbopack optimization, image lazy-loading.
- **Security:** AES-256 encryption for PII, Scrypt password hashing, rate limiting, no secrets in client code.
- **Accessibility:** WCAG 2.1 AA keyboard navigation, high contrast ratios, accessible forms.
- **Mobile First:** Responsive layout optimized for smartphones (320px to 420px) through 4K displays.
