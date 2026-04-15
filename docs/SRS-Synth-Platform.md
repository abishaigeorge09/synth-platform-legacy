# Software Requirements Specification (SRS)

## Synth Sports — Unified Coach Data Platform

| Document | Version | Date |
|----------|---------|------|
| SRS | 0.1 | 2026-04-10 |

**Status:** Draft — aligned with pitch narrative and product mockups in this repository.

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements for **Synth** (stylized **synth.**), a software platform that aggregates athletic and operational data from coaches’ and athletes’ disparate tools into a **single coach dashboard**, with an optional **browser-based agent** for ingestion beside existing workflows.

It also summarizes **recommended architecture** and **design principles** for implementation.

### 1.2 Scope

**In scope**

- Web application: coach-facing dashboard (roster, signals, compliance, AI-style summaries).
- Data ingestion from designated **connectors** (e.g. spreadsheets, team ops tools, wearables, calendars, email metadata).
- **Synth agent**: client component (e.g. browser extension) that assists capture/sync without replacing every underlying system.
- Identity and team context (coach signed in, team/roster scope).
- Presentation of merged, normalized views and alerting (“at risk”, compliance, load vs. sleep, etc.).

**Out of scope (initial phases)**

- Replacing third-party products (TeamWorks, Google Workspace, etc.) end-to-end.
- Hardware firmware or direct device pairing (beyond what vendor APIs allow).
- Full LLM training; product may call external models for insight generation under separate AI/ML specs.

### 1.3 Definitions

| Term | Definition |
|------|------------|
| **Connector** | Integration that reads and/or writes a class of external data (Sheets, TeamWorks, wearable vendor, etc.). |
| **Coach connectors** | Systems owned or operated at the program level (roster sheets, calendar, email digests, broadcast tools). |
| **Athlete feeds** | Data tied to individual athletes, often from devices/apps and per-athlete tool usage. |
| **Synth layer** | The unified logical layer where normalized entities and metrics are stored and served to the UI. |
| **Synth agent** | Lightweight client (e.g. extension) that runs in the coach’s browser context to scrape, assist auth, or trigger sync beside native UIs. |

### 1.4 References

- Product narrative: pitch deck (“Synth agent workflow”, setup, dashboard slides).
- Design language: full-screen deck UI patterns in `CLAUDE.md` (typography, motion, density).

---

## 2. Overall Description

### 2.1 Product Perspective

Synth sits **between** existing SaaS and files and the **coach’s mental model** of “one team, one roster, one place to act.” It is not the system of record for every domain; it **aggregates, tags, and surfaces** signals, with clear provenance (which connector, which athlete).

### 2.2 User Classes

| User class | Goals |
|------------|--------|
| **Head / assistant coach** | See roster health, compliance, load vs. recovery, intervene on risk. |
| **Strength / performance staff** | Erg, lift, wearable trends aligned to roster rows. |
| **Ops / admin** | Roster source of truth hooks (CSV upload, email lists), connector health. |
| **Athlete (indirect)** | Does not need to log into Synth if data arrives via connectors; optional athlete-facing surfaces are out of scope for v1 unless specified later. |

### 2.3 Operating Constraints

- **Privacy & consent**: ingest only what program policy and integrations allow; auditable connector grants.
- **Rate limits**: respect third-party APIs and scraping etiquette where the agent is used.
- **Availability**: dashboard should degrade gracefully if a connector is delayed (stale badges, last-sync time).

### 2.4 Assumptions and Dependencies

- Coaches use modern browsers; extension targets Chromium first if shipped.
- Identity provider or email/password acceptable for MVP; SSO for enterprises in a later phase.
- External systems expose data via API, export, or DOM-level access that the agent can legally use per terms of service.

---

## 3. System Features (Functional Requirements)

### 3.1 Authentication and Team Context

| ID | Requirement |
|----|-------------|
| FR-AUTH-1 | A signed-in user shall have a **coach profile** associated with one or more **teams** (e.g. program, squad). |
| FR-AUTH-2 | The UI shall display **team scope** in overview (e.g. roster count, team name). |
| FR-AUTH-3 | Session shall expire per security policy; extension shall not store long-lived secrets in plain text. |

### 3.2 Dashboard — Team Overview

| ID | Requirement |
|----|-------------|
| FR-DASH-1 | Present a **Team Overview** with subtitle showing team identity and **ingestion summary** (e.g. N sources ingesting). |
| FR-DASH-2 | Show **connector status chips** per source type (e.g. Sheets synced, TeamWorks last sync, wearable live). |
| FR-DASH-3 | Provide **signal visualizations** (e.g. weekly source signal bars, compliance vs. load) when enabled. |
| FR-DASH-4 | Render an **athlete table** with core columns: name/position, key performance fields (e.g. erg, split, squat, load, sleep, compliance), **status** (e.g. OK / at risk). |
| FR-DASH-5 | Display an **AI insight** region summarizing cross-signal patterns (fatigue, compliance drops) with references to ingested sources. |
| FR-DASH-6 | Support navigation placeholders: Dashboard, Lineups, Athletes, Sources (exact IA may evolve). |

### 3.3 Connectors and Ingestion

| ID | Requirement |
|----|-------------|
| FR-CONN-1 | Support configurable **coach connectors** (e.g. Google Sheets, TeamWorks, calendar, email digests). |
| FR-CONN-2 | Support **per-athlete** tagged feeds where metadata allows (device/app/wearable pipelines). |
| FR-CONN-3 | Ingestion jobs shall record **last success time** and surface **stale** or **error** states in the UI. |
| FR-CONN-4 | Initial onboarding shall allow **CSV + athlete emails** and **connector selection** (as in setup flow narrative). |

### 3.4 Synth Agent (Browser Extension)

| ID | Requirement |
|----|-------------|
| FR-AGENT-1 | Offer installation/discovery from the dashboard (“Deploy agent” narrative). |
| FR-AGENT-2 | Operate in the browser context to **assist** data capture (e.g. following coach actions on supported sites) without duplicating full app UX. |
| FR-AGENT-3 | Communicate securely with Synth backend using scoped tokens. |

### 3.5 Workflow Concept (Product Story)

| ID | Requirement |
|----|-------------|
| FR-FLOW-1 | The system shall conceptually separate **athlete-layer** streams from **coach-layer** streams while merging them in the **same dashboard model**. |
| FR-FLOW-2 | Merged outputs shall map to concrete UI blocks: **roster table**, **signal charts**, **compliance**, **AI insight**. |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-PERF-1 | Performance | Dashboard initial load under agreed p95 target on broadband; table virtualized if roster > 100 rows. |
| NFR-SEC-1 | Security | TLS everywhere; secrets in vault; principle of least privilege for connector tokens. |
| NFR-REL-1 | Reliability | Ingestion retries with backoff; idempotent writes to internal store. |
| NFR-ACC-1 | Accessibility | WCAG 2.1 AA target for web dashboard; keyboard operable core flows. |
| NFR-OBS-1 | Observability | Structured logs for sync jobs; metrics for connector success rates. |

---

## 5. External Interface Requirements

### 5.1 User Interfaces

- **Web**: Responsive coach dashboard (primary target: desktop/laptop; tablet-friendly).
- **Extension**: Manifest v3 (if Chromium), minimal permissions, clear permission prompts.

### 5.2 Software Interfaces

- REST or GraphQL **backend API** for dashboard and agent.
- **Connector adapters** as separate modules/services per integration.
- Optional **message queue** for async ingestion (events, webhooks).

### 5.3 Hardware Interfaces

- None direct; devices accessed via vendor clouds/APIs.

---

## 6. How to Build It — Architecture (Recommended)

### 6.1 High-Level

```
[ Third-party APIs & web UIs ]
           │
           ▼
[ Connector layer ] ──► [ Ingestion / ETL ] ──► [ Canonical data store ]
           ▲                      │
    [ Synth agent ]               ▼
                           [ API + auth ]
                                  │
                                  ▼
                           [ Web dashboard ]
```

- **Canonical model**: Athlete, Team, Metric snapshots, Connector run, Insight artifact.
- **Separation**: Connector code isolated; schema versioning for evolving sports metrics.

### 6.2 Suggested Stack (Web)

- **Frontend**: React, TypeScript, Vite (matches internal deck tooling); state via modern library as needed.
- **Backend**: Node or Go services for APIs; PostgreSQL for relational core; object store for large exports.
- **Jobs**: Worker queue for sync (e.g. BullMQ, Cloud Tasks, SQS).
- **Extension**: Thin client posting events/tokens to backend; content scripts scoped per domain policy.

### 6.3 Phased Delivery

| Phase | Deliverable |
|-------|-------------|
| **P0** | Auth, team, CSV onboarding, 1–2 connectors, read-only dashboard + table. |
| **P1** | Additional connectors, agent MVP, AI insight from templated rules + optional LLM. |
| **P2** | Enterprise SSO, advanced permissions, mobile-friendly views. |

---

## 7. Design — Product UX and Visual System

### 7.1 UX Principles

1. **One surface**: Primary action is understanding the team; deep links to sources when correction is needed.
2. **Provenance**: Always show *where* a number came from (connector + time).
3. **Coach vs athlete streams**: Educate in onboarding/workflow views; collapse to unified table in steady state.
4. **Calm density**: Data-heavy but scannable — monospace for metrics, serif for narrative headlines where used.

### 7.2 Visual Language (from brand deck)

- **Palette**: Emerald primary (`#059669` family), neutrals for text and borders, semantic colors for risk (amber/red), accents for connector families (cyan, purple, blue).
- **Typography**: JetBrains Mono (labels, data, nav), Instrument Sans (body), Fraunces (optional editorial headlines).
- **Components**: Highlight bars, stat cards, dashed rules, pixel motifs on marketing surfaces; **dashboard** uses SaaS clarity over decoration.
- **Motion**: Page transitions ~350ms; staggered cards; charts animate growth for comprehension.

### 7.3 Dashboard Layout (Conceptual)

- **Top**: Browser chrome mock → URL, live badge, **Synth agent** CTA.
- **Left nav**: Dashboard, Lineups, Athletes, Sources.
- **Main**: Title + connector chips → charts (optional) → **scrollable table** → **insight panel**.

---

## 8. Traceability (Deck ↔ Requirements)

| Deck concept | SRS coverage |
|--------------|----------------|
| Setup account + connectors | FR-CONN-4, FR-DASH-1 |
| Synth agent workflow diagram | FR-FLOW-1, FR-FLOW-2, FR-AGENT-* |
| Team Overview table + charts | FR-DASH-2 — FR-DASH-4 |
| AI insight copy | FR-DASH-5 |
| Deploy / extension | FR-AGENT-1, FR-AGENT-2 |

---

## 9. Open Items

- Exact connector list and OAuth vs. service-account models per vendor.
- Data retention and deletion per GDPR/FERPA as applicable.
- Formal threat model for extension permissions.

---

*End of document.*
