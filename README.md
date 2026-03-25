# 🧠 MedAI: Decentralized Medical Intelligence Protocol

**MedAI** is an AI-powered healthcare platform that bridges the gap between patient care, artificial intelligence, and decentralized finance. It provides real-time symptom analysis, connects patients with doctors, and facilitates secure, transparent payments via blockchain technology.

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

*   **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS.
*   **AI**: OpenAI API (GPT-4o), Web Speech API.
*   **Backend / Auth**: Supabase (PostgreSQL, Auth & Row Level Security).
*   **Web3**: Wagmi, Viem, RainbowKit, Ethereum/Polygon (Testnet).
*   **Deployment**: Vercel (Frontend), Supabase (Database).

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
    cd medai-platform/frontend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file in the root directory:
    ```bash
    # AI Brain
    OPENAI_API_KEY=sk-your-openai-key

    # Auth & Database
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```

5.  **Open the App**
    Visit [http://localhost:3000](http://localhost:3000) to launch MedAI.

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
