# 🎓 GATE CSE Hub — Private Study & 40-Year PYQ Mastery Platform

A comprehensive study dashboard and revision platform for **GATE Computer Science & Information Technology (GATE CSE)**, featuring weighted subject tracking, curated video lectures, an authentic 40-Year Previous Year Question (PYQ) drill bank across 3 volumes, and AI-powered study mentors.

---

## 🌟 Key Features

### 📚 1. 3-Volume 40-Year PYQ Revision System (1987 – 2026)
Organized systematically across 3 authentic volumes spanning **1,247 pages and ~3,838 GATE questions**:
- **Volume 1: Mathematics & General Aptitude (1,125 Questions)**
  - Discrete Mathematics (Combinatorics, Graph Theory, Logic, Sets & Lattices)
  - Engineering Mathematics (Linear Algebra, Calculus, Probability & Statistics)
  - General Aptitude (Quantitative, Verbal, Analytical, Spatial Reasoning)
- **Volume 2: Core Computer Science (1,263 Questions)**
  - Algorithms (Asymptotics, Sorting, Dynamic Programming, Greedy, Graph Algorithms)
  - Programming & Data Structures (C Pointers, Recursion, Stacks/Queues, Trees, Heaps, Hashing)
  - Theory of Computation (Regular Languages, Grammars, PDA, Turing Machines, Decidability)
  - Compiler Design (Lexical, LL/LR Parsers, SDT, Intermediate Code, Code Optimization)
- **Volume 3: Computer Systems (1,450 Questions)**
  - Operating Systems (CPU Scheduling, Semaphores, Deadlocks, Virtual Memory, File Systems)
  - Computer Organization & Architecture (Addressing Modes, Cache, Pipelining, Computer Arithmetic)
  - Databases / DBMS (Relational Algebra, SQL, Normalization 1NF..BCNF, Transactions, B+ Trees)
  - Computer Networks (Data Link, CSMA/CD, IPv4/IPv6, Routing Protocols, TCP/UDP)
  - Digital Logic (Boolean Algebra, K-Maps, Combinational & Sequential Circuits, Counters)

---

### 🎯 2. Automated 10-MCQ Chapter Mastery Drills
- **Instant Chapter Tests:** Whenever any chapter is completed, a targeted 10-question MCQ test is generated automatically.
- **Timed Exam Simulation:** 15-minute countdown timer with 1..10 question navigator.
- **Mathematical Derivations:** Instant step-by-step solutions, key exam tips, and GATE negative marking calculations.
- **Scorecards & Progress Tracking:** Real-time streak updates and accuracy tracking.

---

### 🤖 3. AI Study Mentors & Tools (Powered by Gemini 2.5 Flash)
- **Ask AI Multi-Turn Chat:** Context-aware doubt resolution with formula derivations and proof assistance.
- **Feynman 3-Tier Explainer:** Deconstructs complex topics into an Analogy, Technical Mechanics, and Exam Trap analysis.
- **Formula & Complexity Matrix:** Instant cheat-sheets for mathematical formulas and algorithm complexity tables.
- **AI Weekly Study Planner:** Holiday-aware customized 7-day study sprint generator.
- **Exam News Grounding:** Real-time official GATE news and deadlines.

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### Installation & Run
1. Clone the repository:
   ```bash
   git clone https://github.com/demovirat4-max/gate-cse-hub.git
   cd gate-cse-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional for AI features):
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY in .env
   ```

4. Start the application:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend:** Express.js, Node.js, Google GenAI SDK (Gemini 2.5 Flash)
- **Data:** 40-Year GATE CSE Archive (1987 – 2026), Local Disk & Browser Cache Sync
