# 🧠 NIRVAAAN: Decentralized Medical Intelligence Protocol

**NIRVAAAN** is an AI-powered healthcare platform that bridges the gap between patient care, artificial intelligence, and decentralized finance. It provides real-time symptom analysis, connects patients with doctors, and facilitates secure, transparent payments via blockchain technology.

![MedAI Dashboard Preview](https://via.placeholder.com/1200x600?text=MedAI+Dashboard+Preview)

## 🚀 Key Features
 
### 1. **AI Health Assistant (The Brain)** 
   *   **Real-time Diagnosis**: Uses **OpenAI GPT-4o** to analyze symptoms and provide preliminary medical advice with disclaimers.
   *   **Voice Interface**: Natural language voice commands for hands-free interaction.
   *   **Actionable Insights**: Automatically detects intent (e.g., "Book appointment") and triggers relevant UI flows.
  
### 2. **Doctor-Patient Marketplace** 
   *   **Patient Dashboard**: Manage appointments, view prescriptions, and track medical history.
   *   **Provider Portal**: Dedicated interface for doctors to manage patients, join video calls, and digitally sign prescriptions.
   *   **Video Consultations**: Integrated Google Meet links for seamless telehealth sessions.

### 3. **Web3 & Payments (The Chain)** 
   *   **Smart Wallet**: Built-in crypto wallet support (via **RainbowKit** & **Wagmi**).
   *   **Secure Transactions**: Pay for consultations and prescriptions using ETH/USDC (Simulated on Testnet).
   *   **Transparency**: Immutable record of medical transactions.

### 4. **Enterprise-Grade Security**
   *   **Authentication**: Secure login/signup via **Supabase Auth**.
   *   **Role-Based Access**: Specialized views for Patients vs. Doctors.
   *   **Data Privacy**: HIPAA-compliant data handling practices (Architecture ready).

---

## 🛠 Tech Stack

*   **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS.
*   **AI**: OpenAI API, Web Speech API.
*   **Backend / Auth**: Next.js Route Handlers + Supabase (PostgreSQL, Auth, RLS).
*   **Web3**: Wagmi, Viem, RainbowKit, Ethereum/Polygon (Testnet).
*   **Deployment**: Vercel (Frontend), Supabase (Database).

---

## 📁 Project Structure

```text
health-ai/
├── frontend/   # Next.js web app (UI + app/api route handlers)
├── backend/    # Reserved for standalone backend services/workers
└── supabase/   # Supabase project config/migrations
```

---

## ⚡ Getting Started

### Prerequisites
*   Node.js 18+
*   OpenAI API Key
*   Supabase Project (URL & Anon Key)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/medai-platform.git
    cd medai-platform
    ```

2.  **Install frontend dependencies**
    ```bash
    cd frontend
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file in `frontend/`:
    ```bash
    # AI Brain (recommended)
    OPENROUTER_API_KEY=your-openrouter-key
    GROQ_API_KEY=your-groq-key
    # Optional fallback
    OPENAI_API_KEY=your-openai-key

    # Auth & Database
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

4.  **Run the Development Server**
    ```bash
    cd frontend
    npm run dev
    ```

5.  **Open the App**
    Visit [http://localhost:3000](http://localhost:3000) to launch MedAI.

Optional (from repository root):
```bash
npm run dev
```
Root scripts proxy to `frontend/`.

---

## 🗺 Roadmap Status

*   ✅ **Phase 1**: Core AI & Dashboard (Completed)
*   ✅ **Phase 2**: Smart Contracts & Web3 (Completed)
*   ✅ **Phase 3**: Doctor Marketplace (Completed)
*   🚧 **Phase 4**: Mainnet Deployment & Audits (In Progress)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ by Aayush Kumar Singh*
