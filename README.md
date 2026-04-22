# Restaurant Operations Dashboard

A modern, AI-powered restaurant operations dashboard for managing orders, tracking revenue, forecasting demand, and analyzing performance in real-time.

## ✨ Features

### 📋 Orders Management
- **Kanban Board** — Drag-and-drop order workflow (New → Preparing → Ready → Served)
- **Table View** — Sortable, filterable order list
- **Bar View** — Visual order timeline
- Real-time order simulation

### 💰 Revenue Analytics
- **This Week** — 7-day revenue trends with daily breakdowns
- **MTD (Month-to-Date)** — Monthly performance with daily bar charts
- **YTD (Year-to-Date)** — Annual overview with monthly area charts
- KPI cards with period-over-period delta comparisons
- Category mix donut charts
- Top-performing items tables

### 🔮 AI Forecast
- AI-powered busy hour prediction for tomorrow
- Smart preparation tips based on 7-day order patterns
- Hourly demand visualization

### 📊 Performance Insights
- AI analysis panel with actionable insights
- Analytics overview with key metrics
- Trend tracking across time periods

### 🍽️ Menu Manager
- Full menu CRUD operations
- Category organization
- Pricing and availability controls

## 🛠️ Tech Stack

- **Framework**: TanStack Start v1 (React 19 + SSR)
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4 with semantic design tokens
- **UI Components**: shadcn/ui + Radix UI
- **Charts**: Recharts
- **State Management**: Zustand
- **Routing**: TanStack Router (file-based)
- **Backend**: Lovable Cloud (Supabase)
- **AI**: Lovable AI Gateway (Google Gemini)
- **Language**: TypeScript (strict mode)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd <project-folder>

# Install dependencies
npm install
# or
bun install
