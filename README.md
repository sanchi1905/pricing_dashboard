# KLYPUP: Dynamic Pricing Intelligence Hub 🚀

**Applied AI Technical Assessment — Option B**

A sophisticated, full-stack Pricing Intelligence platform powered by a multi-agent AI pipeline. Built to solve real-world revenue leakage (estimated 8–12%) by moving from static pricing to strategic, agentic optimization.

## 🌟 Key Features

- **Multi-Agent AI Pipeline**: Orchestrates 5 specialized AI agents (Market, Demand, Inventory, Strategy, and Compliance) to synthesize complex pricing strategies.
- **Human-in-the-Loop (HITL)**: A robust approval workflow that inhibits auto-execution for low-confidence recommendations, requiring human expert review.
- **Explainable AI (XAI)**: Provides deep reasoning and agent-by-agent rationale for every price change—no "black box" decisions.
- **Enterprise Foundations**: 
  - **Multi-Tenant Isolation**: Complete data privacy across different organizations.
  - **RBAC**: Role-based access control (Admin vs. Analyst).
  - **Immutable Audit Trail**: A perfect ledger of every pricing action taken by AI or humans.
- **Modern Tech Stack**: Next.js 16 (App Router), PostgreSQL (Prisma), Tailwind CSS 4, and shadcn/ui with a premium Glassmorphism design.

## 🚀 Live Demo

**[Visit Live Site](https://pricing-dashboard-eight.vercel.app)**  
*Demo Credentials:*  
- **Email**: `admin@techmart.com`  
- **Password**: `admin123`  
- *Tip: Use the "Seed Demo Data" button on the login screen for the best first-time experience.*

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4.
- **Backend**: Next.js API Routes, Node.js.
- **Database**: PostgreSQL (Neon.tech) with Prisma ORM.
- **AI/LLM**: Multi-Agent Orchestration (Claude-powered synthesis).
- **Authentication**: Custom JWT-based Auth with Bcrypt.
- **Deployment**: Vercel.

## 📦 Getting Started

### Prerequisites
- Node.js (Latest stable version)
- PostgreSQL database (or Neon.tech account)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sanchi1905/pricing_dashboard.git
   cd pricing_dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   JWT_SECRET="your_secure_random_key"
   ```

4. **Initialize the Database**:
   ```bash
   npx prisma db push
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the result.

## 🏗️ Architecture

The system utilizes a sequential agent pattern where the **Pricing Strategy Agent** acts as an orchestrator, consuming enriched signals from upstream agents (Market Intel, Demand Forecast, Inventory) before generating a final confidence-scored recommendation.

---
*Klypup Applied AI Intern Assessment Solution | Prepared April 2026*
