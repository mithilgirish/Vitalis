<p align="center">
  <img src="docs/Vitalis_logo.png" alt="Vitalis Logo" width="200" />
</p>

# Vitalis

**An agentic, predictive supply chain network for medical supply redistribution.**

## 📖 Overview

Blood and critical biological supply shortages result in approximately 100,000 preventable deaths each year in developing nations. This is fundamentally a logistical failure: regional hospital inventories remain heavily siloed, and cross-facility visibility is completely non-existent until a patient enters critical shock.

Vitalis transforms this reactive, fragmented approach into a seamlessly coordinated network. By fusing time-series demand forecasting with an autonomous LangChain dispatch agent, the platform parses chaotic unstructured emergency requests, forecasts inventory shortages up to 14 days in advance, and instantly recommends optimal, viability-weighted resource redistributions.

## ✨ Core Features

* **Agentic Dispatch Coordinator:** A LangChain ReAct agent orchestrates solutions for supply deficits through autonomous tool execution, utilizing Text-to-SQL for inventory lookups, evaluating depletion guardrails, and calculating spatial viability routing.


* **Predictive Stockout Engine:** Meta Prophet time-series models execute nightly on historical consumption data to generate rolling 7-to-14-day demand intervals. Concurrently, an XGBoost classifier flags specific facilities where projected demand exceeds available unexpired inventory within a 72-hour window.


* **Unstructured Triage Ingestion:** A Langflow pipeline paired with a fine-tuned NER model extracts structured payloads—such as resource type, blood group, required units, and ESI urgency—directly from chaotic radio transcripts and SMS messages.


* **Human-in-the-Loop (HITL) Governance:** To ensure strict operational safety, all transfers require explicit click-to-dispatch verification by an authenticated admin via the Next.js command center; no autonomous transfers are executed without human oversight.


* **Cold-Chain Telemetry:** A React Native mobile driver app manages turn-by-turn logistics routing and enforces IoT cold-chain temperature verification prompts during transit.



## 🏗️ Architecture & Tech Stack

* **Frontend (Web):** Next.js and Tailwind CSS power the admin command console and network topology mapping.


* **Frontend (Mobile):** React Native and Expo handle logistics driver dispatch and barcode scanning operations.


* **API Backend:** FastAPI serves the asynchronous REST endpoints and machine learning models.


* **Database & GIS:** PostgreSQL (via Supabase) and PostGIS manage spatial geometry, row-level security, and real-time ledger synchronization.


* **Orchestration & ML:** LangChain, Langflow, Meta Prophet, scikit-learn, and XGBoost drive the intelligence and multi-agent coordination.



## 📂 Repository Structure

```text
vitalis/
├── apps/
│   ├── web/                              # Next.js Command Center
│   └── mobile/                           # React Native Courier App (Expo)
├── backend/                              # FastAPI & LangChain Ecosystem
│   ├── api/                              # REST endpoints
│   └── agent/                            # ReAct Agent logic & Custom Tools
├── ml_pipeline/                          # Predictive Stockout Engine & ML
│   ├── data/                             # Raw & processed CDC NHAMCS dataset
│   └── notebooks/                        # Model training (Prophet & XGBoost)
├── database/                             # Supabase & PostGIS DDL scripts
└── docs/                                 # Architecture diagrams & PRD
```