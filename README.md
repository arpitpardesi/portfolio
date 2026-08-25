# 🌌 Arpit Pardesi — Digital Aether Portfolio

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https%3A%2F%2Farpitpardesi.github.io%2Fportfolio-ef4444?style=for-the-badge&logo=github&logoColor=white)](https://arpitpardesi.github.io/portfolio)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.23.26-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Matter.js](https://img.shields.io/badge/Matter.js-0.20.0-4B5563?style=for-the-badge&logo=javascript&logoColor=white)](https://brm.io/matter-js/)

**A dynamic, space-themed developer portfolio and interactive showcase built where logic meets imagination.**

[Explore Live Portfolio](https://arpitpardesi.github.io/portfolio) • [View Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

</div>

## 🪐 Overview

**The Digital Aether** is an immersive, interactive personal portfolio website built with React 18, Firebase, and Framer Motion. Designed around a futuristic space aesthetic, it bridges the gap between binary logic and aesthetic storytelling.

From dynamic real-time theme customization to interactive zero-gravity physics, visitor star constellations, and a built-in content management system (CMS), this portfolio is designed to deliver a memorable visual and tactile user experience.

---

## ✨ Key Features & Highlights

### 1. 🎨 Dynamic Chromatic Theme System
- **Martian Red Default**: The portfolio opens in an intense, energetic **Martian Red** glow (`#ef4444`).
- **14 Space Preset Themes**: Seamlessly switch between themes such as *Void Purple*, *Nebula Blue*, *Aurora Green*, *Stellar Gold*, *Pulsar Pink*, *Supernova*, *Deep Space*, and more.
- **Custom Theme Creator**: Add and save custom color palettes in real-time via the Admin Dashboard.
- **Persistent State**: Theme preferences automatically sync across sessions using local storage and Firestore settings.

### 2. ⚛️ Interactive Physics Playground
- Built using **Matter.js** 2D physics engine.
- Zero-gravity interactive sandbox allowing visitors to throw, bounce, collide, and destroy physical objects on canvas.
- Real-time gravity controls, body spawning, and force fields.

### 3. 🌌 Constellation of Souls (Visitor Network)
- **Stellar Resonance Counter**: Real-time visitor counter powered by Firebase Cloud Firestore.
- **Interactive Starfield Overlay**: Clicking the visitor pill triggers a performance-optimized HTML5 Canvas overlay, rendering a unique drifting star for every historic visitor who has visited the portfolio.

### 4. ⌨️ Universal Command Palette (`Cmd + K` / `Ctrl + K`)
- Instant keyboard-driven navigation across sections.
- Quick search for projects, skills, and hobby hubs.
- Direct theme switcher and action shortcuts (email copying, resume opening).

### 5. 🛠️ Chronicles of Passion (Hobby Hubs)
Dedicated visual showcases exploring passions beyond traditional web code:
- 📷 **Light & Shadow**: Photography gallery showcasing capturing moments in time.
- ⚡ **Pulse of Silicon**: Hardware, IoT, and Raspberry Pi experimentation.
- 🧠 **The Thinking Machine**: Machine learning and AI-driven exploratory projects.

### 6. 🔐 Admin Dashboard & CMS
- Protected authentication via **Firebase Auth**.
- **Real-Time Global Settings**: Modify site title, hero text, about section, social links, feature toggles, and active default themes without re-deploying code.
- **Analytics & Content Management**: View visitor breakdown charts (Recharts) and perform full CRUD operations on projects, timeline entries, and skills.

---

## 🛠️ Tech Stack & Architecture

| Category | Technologies / Libraries |
| :--- | :--- |
| **Frontend Core** | React 18, React Router v7, JavaScript (ES6+), HTML5 Canvas |
| **Styling & Motion** | Vanilla CSS (CSS Variables, Glassmorphism), Framer Motion |
| **Physics & Graphics** | Matter.js, HTML5 Canvas API |
| **Database & Auth** | Firebase 12 (Cloud Firestore, Firebase Authentication) |
| **Analytics & UI** | Recharts, React Icons, React Colorful, React Helmet Async |
| **Deployment** | GitHub Pages (`gh-pages`) |

---

## 📁 Directory Structure

```
portfolio/
├── build/                    # Production build output
├── public/                   # Static assets & index.html
├── src/
│   ├── components/           # UI Components
│   │   ├── admin/            # Admin CMS & Analytics Dashboard components
│   │   ├── About.js          # Main Bio & About section
│   │   ├── AllProjectsPage.js# Complete projects directory
│   │   ├── BeyondWork.js     # Hobby hubs overview
│   │   ├── CommandPalette.js # Cmd+K modal search & shortcuts
│   │   ├── Hero.js           # Interactive hero section
│   │   ├── IOT.js            # Hardware & IoT showcase
│   │   ├── PhysicsPlayground.js # Matter.js sandbox component
│   │   ├── ProjectModal.js   # Detailed project view modal
│   │   ├── Projects.js       # Filterable projects grid
│   │   ├── StarFieldOverlay.js # Constellation of Souls Canvas overlay
│   │   ├── ThemeSwitcher.js  # Orbital theme selector widget
│   │   └── ...               # Additional section components
│   ├── context/
│   │   ├── AuthContext.js    # Firebase Auth provider
│   │   └── SettingsContext.js# Real-time Firestore settings & theme provider
│   ├── firebase.js           # Firebase app initialization & Firestore config
│   ├── App.js                # Main router & app layout
│   ├── index.css             # Core design system tokens & CSS variables
│   └── index.js              # Application entry point
├── DEPLOYMENT_GUIDE.md       # Comprehensive local setup & deployment guide
├── package.json              # Dependencies & npm scripts
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v16 or higher) and npm installed on your system.

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/arpitpardesi/portfolio.git
   cd portfolio
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase (Optional for local dev)**
   Create or verify your Firebase configuration in `src/firebase.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```
   The application will open automatically at `http://localhost:3000`.

---

## 📦 Deployment

This project is configured for automated deployment to **GitHub Pages** using `gh-pages`.

To build and deploy the latest version:

```bash
npm run deploy
```

> **Note**: For detailed instructions on running locally, committing changes, and managing deployments, refer to the [Deployment Guide](./DEPLOYMENT_GUIDE.md).

---

## 📬 Contact & Socials

**Arpit Pardesi** — *Software Developer & Creative Technologist*

- 🌐 **Portfolio**: [https://arpitpardesi.github.io/portfolio](https://arpitpardesi.github.io/portfolio)
- 🐙 **GitHub**: [@arpitpardesi](https://github.com/arpitpardesi)
- 💼 **LinkedIn**: [arpitpardesi](https://www.linkedin.com/in/arpitpardesi/)
- 🪶 **X / Twitter**: [@arpit_pardesi](https://x.com/arpit_pardesi)
- 📸 **Instagram**: [@arpitpardesi](https://www.instagram.com/arpitpardesi)
- ✉️ **Email**: [arpit.pardesi6@gmail.com](mailto:arpit.pardesi6@gmail.com)

---

<div align="center">

*“I weave together data, design, and code to build experiences that feel intuitive and alive.”*

© 2026 Arpit Pardesi. All rights reserved.

</div>
