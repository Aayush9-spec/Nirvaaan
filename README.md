# 🧠 NIRVAAAN: Decentralized Medical Intelligence Protocol

[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://health-ai-murex-zeta.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green?logo=supabase)](https://supabase.com/)

**NIRVAAAN** is a high-performance, AI-powered healthcare platform designed to bridge the gap between patient care, artificial intelligence, and decentralized finance. By integrating real-time symptom analysis with a Web3 payment layer, NIRVAAAN creates a secure, transparent, and efficient medical intelligence ecosystem.

🔗 **Live Demo:** [https://health-ai-murex-zeta.vercel.app/](https://health-ai-murex-zeta.vercel.app/)

---

## 🚀 Key Features
 
### 1. 🧠 AI Health Assistant (The Neural Engine)
- **Real-time Diagnosis:** Powered by **GPT-4o** to analyze complex symptoms and provide preliminary medical intelligence with strict safety disclaimers.
- **Voice-First Interface:** Integrated Web Speech API for hands-free, natural language interaction.
- **Intent-Driven Routing:** The AI doesn't just talk; it acts. It detects intents (e.g., *"I need a cardiologist"*) and automatically triggers the booking flow.

### 2. 🩺 Doctor-Patient Marketplace
- **Unified Patient Dashboard:** A sleek, glassmorphism interface to manage appointments, prescriptions, and medical history.
- **Specialized Provider Portal:** Dedicated tools for verified doctors to manage patient queues, host video consultations, and issue digital prescriptions.
- **Telehealth Integration:** Seamless video connectivity via Google Meet for instant remote care.

### 3. ⛓️ Web3 & Payments (The Trust Layer)
- **Decentralized Health Wallet:** Built-in crypto support via **RainbowKit** & **Wagmi**.
- **Transparent Billing:** Consultations and prescriptions are handled via ETH/USDC, ensuring immutable payment records.
- **Health NFTs:** Architecture ready for patient-owned medical records stored as secure on-chain assets.

### 4. 🛡️ Enterprise-Grade Security
- **Authentication:** Industrial-strength identity management via **Supabase Auth**.
- **RBAC (Role-Based Access Control):** Strict separation between Patient and Doctor privileges.
- **Privacy First:** Built with a HIPAA-compliant mindset, utilizing Row Level Security (RLS) at the database layer.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | `Next.js 15`, `TypeScript`, `Tailwind CSS` | App Router, Type-safe UI, Glassmorphism Design |
| **AI Intelligence** | `OpenAI GPT-4o`, `Web Speech API` | Symptom Analysis & Voice Processing |
| **Backend/Auth** | `Supabase` (Postgres, Auth, RLS) | Real-time DB, User Management, Security |
| **Web3 Layer** | `Wagmi`, `Viem`, `RainbowKit` | Ethereum/Polygon Integration, Wallet Connect |
| **Infrastructure** | `Vercel` | Edge Deployment & CI/CD |

---

## 📁 Project Structure

```text
health-ai/
├── frontend/       # Next.js 15 web application (Core UI & API Routes)
│   ├── app/        # App Router (Pages, Layouts, Server Components)
│   ├── components/ # Reusable UI elements (Glassmorphism components)
│   └── lib/        # Supabase, AI, and Web3 utility functions
├── backend/        # Reserved for standalone microservices & AI workers
└── supabase/       # Database migrations, RLS policies, and Edge Functions
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js 18+**
- **OpenAI API Key** (or OpenRouter/Groq)
- **Supabase Project** (URL & Anon Key)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aayush9-spec/Health_AI.git
   cd Health_AI
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the `frontend/` directory:
   ```env
   # AI Brain
   OPENROUTER_API_KEY=***
   GROQ_API_KEY=***
   OPENAI_API_KEY=***

   # Auth & Database
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_s..._key
   ```

4. **Launch the Platform**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to experience NIRVAAAN.

---

## 🗺 Roadmap Status

- [x] **Phase 1: Core AI & Dashboard** $\rightarrow$ *Completed*
- [x] **Phase 2: Smart Contracts & Web3 Integration** $\rightarrow$ *Completed*
- [x] **Phase 3: Doctor Marketplace & Portal** $\rightarrow$ *Completed*
- [ ] **Phase 4: Mainnet Deployment & Security Audits** $\rightarrow$ *In Progress*

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

**Built with ❤️ by Aayush Kumar Singh**
