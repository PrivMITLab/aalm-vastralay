# 🔒 AALM VASTRALAY (आलम वस्त्रालय) — PRIVACY POLICY SPECIFICATION
> **Document Location:** `docs/PRIVACY.md`  
> **Statutory Compliance:** Digital Personal Data Protection Act, 2023 (DPDP Act) · Information Technology Act, 2000 · Consumer Protection (E-Commerce) Rules, 2020  
> **Headquarters:** Kalyanipur, District Samastipur, Bihar – 848302, India  
> **Live Web Route:** [`https://aalm-vastralay.vercel.app/privacy`](https://aalm-vastralay.vercel.app/privacy)

---

## 1. Governance & Data Fiduciary Details
- **Data Fiduciary:** Aalm Vastralay (आलम वस्त्रालय)
- **Place of Business:** Kalyanipur, Bihar 848302, India
- **Grievance Officer:** `grievance@aalmvastralay.com` / `support@aalmvastralay.in`
- **SLA:** Acknowledgment within 48 hours; resolution within 15 business days.

---

## 2. Personal Data Collected & Processed

| Category | Data Points | Statutory Purpose & Basis |
|---|---|---|
| **Identity & Account** | Full name, email, mobile phone, avatar, scrypt-hashed password | User authentication, account management, anti-fraud verification (DPDP Act Sec. 4) |
| **Order & Delivery** | Shipping address, city, state, pincode, contact number, landmark | Order fulfillment, logistics routing, COD serviceability |
| **Bespoke Fitting** | Size measurements, custom blouse stitching specs, bridal consult notes | Precision tailoring and artisan garment customization |
| **Invoicing & Tax** | Order value, HSN codes, 12-digit UPI UTR, statutory GST invoice | Statutory compliance under Rule 46 CGST Rules, 2017 & Section 36 CGST Act |
| **Seller KYC** | Store name, 15-digit GSTIN, bank payout account/IFSC, workshop address | Vendor onboarding, marketplace settlement, Section 79 IT Act intermediary diligence |
| **Technical & Bot Defense** | IP address, user-agent, session cookies, proof-of-work challenges | DDoS defense, rate-limiting, brute-force shielding |

---

## 3. Multi-Vendor Privacy & Tenant Isolation
1. **Masked Contact Feeds:** Sellers only receive the customer's delivery name and shipping address required for dispatch. Direct phone numbers and emails are masked in seller portal order views.
2. **Zero Cross-Store Data Leakage:** Independent boutiques and weavers can only access their own order items, products, and financial ledgers.
3. **No Off-Platform Solicitation:** Sellers are legally prohibited from using customer delivery information for external marketing.

---

## 4. Security Engineering Standards
- **Authenticated Encryption at Rest:** `AES-256-GCM` encryption for sensitive PII and token storage.
- **In-Transit Security:** Enforced TLS 1.3 encryption across all API endpoints with HTTP Strict Transport Security (HSTS).
- **Password Protection:** Scrypt hashing with per-user cryptographic salts (0 plain-text passwords stored).
- **Audit Trails:** Append-only database logs (`audit_logs`) tracking administrative actions and order lifecycle modifications.

---

## 5. Third-Party Data Processors
We share data strictly with essential infrastructure partners under data processing agreements:
- **Logistics:** Delhivery, Shiprocket, and India Post (name, shipping address, contact phone for AWB delivery).
- **Database:** Neon Serverless PostgreSQL hosted in AWS Mumbai (`ap-south-1`) region with pooled connection encryption.
- **Transactional Notifications:** Google Apps Script Web App for zero-domain password reset OTP delivery.
- **Zero Advertising Trackers:** We **never** sell, rent, or trade customer data to advertising brokers or deploy third-party remarketing pixels.

---

## 6. Data Principal Rights (DPDP Act, 2023)
Customers hold full statutory rights:
1. **Access & Portability:** Review profile and order records anytime via `/dashboard` and `/orders`.
2. **Correction:** Update delivery addresses and contact information in real-time.
3. **Erasure:** Request permanent account deletion via `privacy@aalmvastralay.com` (subject to mandatory 8-year tax retention under Section 36 of CGST Act).
4. **Grievance Redressal:** Direct escalation to the appointed Grievance Officer.
