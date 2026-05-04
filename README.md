
# ⚔️ FrameForge AI
### *Your Expert Gaming Buddy & Tech Support Partner*

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini_2.0-orange?logo=google-gemini)](https://ai.google.dev/)

</div>

---

## 🚀 Overview

**FrameForge AI** is a premium, specialized conversational AI designed specifically for gamers and power users. It goes beyond generic chatbots by focusing on technical configurations, hardware bottlenecks, FPS optimizations, and pro-level troubleshooting. Forged with a dark, high-performance aesthetic, it provides real-time gaming intelligence and support.

## ✨ Key Features

- **🎮 Gaming Intelligence**: Specialized in CPU/GPU bottlenecks, optimized game settings, and hardware recommendations.
- **🌐 Web Intelligence Grid**: Integrated Google Search capabilities to pull the latest patch notes, driver versions, and benchmarks.
- **⚡ Real-time Streaming**: Fluid, turn-based conversational interface with real-time response streaming.
- **📁 Session Management**: Persistent chat history saved locally, allowing you to resume your optimization missions anytime.
- **🖥️ Premium UI/UX**:
  - **Glassmorphism Design**: Sleek, modern dark-themed interface with vibrant cyan accents.
  - **Resizable Workspace**: Fully adjustable sidebar for a personalized layout.
  - **Mobile Responsive**: Seamless experience across desktop and mobile devices.
  - **Markdown Support**: Rich formatting for technical guides, code snippets, and performance tables.

## 🛠️ Technical Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS 4, Framer Motion (Motion).
- **Backend**: Node.js with Express (integrated Vite middleware for development).
- **AI Engine**: Google Gemini 2.0 via `@google/genai`.
- **Icons**: Lucide React.
- **Styling**: Modern CSS with glassmorphism and custom animations.

## 🚦 Getting Started

### Prerequisites

- **Node.js**: Version 18.x or higher.
- **Gemini API Key**: Obtain one from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd FrameForge-AI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   *(Note: The app also checks for `.env.local`)*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 📦 Production & Deployment

To prepare the application for production:

1. **Build the Frontend**:
   ```bash
   npm run build
   ```

2. **Start the Production Server**:
   ```bash
   NODE_ENV=production npm start
   ```

The server is configured to serve the static files from the `dist` directory in production mode.

## 📜 License

Distributed under the **Apache-2.0 License**. See `LICENSE` or source headers for more information.

---

<div align="center">
Built with ❤️ for the Gaming Community
</div>

