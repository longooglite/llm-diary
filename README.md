# LLM Diary

An event-sourced personal ledger designed for reflection, decision support, and low-friction ingestion. 

This project is an experiment in **Agentic Vibe-Coding**—a collaborative development loop between a human orchestrator and an AI agent, prioritizing broad creative direction and "architectural minimalist" aesthetics.

## 🏛️ Architecture & Philosophy

The application follows an **Event-Sourced Ingestion** pattern:
1.  **Low-Friction Ingestion**: A simple, ledger-like interface for recording choices, expenses, or moments in natural language.
2.  **Event Ledger**: An append-only store of "facts" that serves as the source of truth.
3.  **LLM Batch Processing**: (Planned) Asynchronous reasoning over ledger facts to generate insights, summaries, and decision audits.

### Principles:
- **Immutable Source of Truth**: All data is stored as events; the UI is a re-buildable projection.
- **Auditability**: Decisions and reflections are timestamped and signed.
- **Human-Centric Design**: Minimalist, developer-tool aesthetic inspired by classic architectural grids.

## 🎨 Design Language: "Architectural Minimalist"

The UI is built on a custom Design System defined in `src/styles/DesignSystem.scss`.

- **Typography**: 
  - `Geist Mono`: Numerical data, facts, and ledger headers.
  - `Geist Sans`: Body text and primary UI interactions.
- **Aesthetic**:
  - Dark mode (`#0a0f1e` "Void") background.
  - Substitute heavy shadows with subtle `1px` borders.
  - Rapid micro-animations for interaction feedback.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Runtime**: [React 19](https://reactjs.org/)
- **Styling**: SCSS Modules + Global Design Tokens
- **Auth**: AWS Cognito (via `react-oidc-context`)
- **Icons/Fonts**: Geist Sans & Mono

## 🚀 Getting Started

### Prerequisites
- Node.js & Yarn/NPM
- Local Environment Config (`.env`)

### Development
```bash
# Install dependencies
yarn install

# Run the dev server
yarn dev
```

### Build
```bash
yarn build
yarn start
```

